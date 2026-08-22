import type { CaseStudy } from "./types";

export const paymentProcessingBackend: CaseStudy = {
  hook:
    "Payment systems fail constantly, by design — networks drop, processes crash mid-step, the same message gets delivered twice. This project explores what it actually takes to make a payment pipeline survive that instead of quietly losing money or double-charging someone, and it doesn't pretend every rough edge along the way is already solved.",

  foundations: [
    {
      term: "API request / response",
      plain:
        "The client sends a request describing a payment, and the API sends back a response — in this case, an immediate acknowledgement, not a confirmation that the payment is fully processed yet.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "client", label: "Client", col: 0 },
          { id: "server", label: "FastAPI /payments", col: 1 },
        ],
        edges: [
          {
            from: "client",
            to: "server",
            direction: "both",
            label: "POST payment details",
            labelReverse: "payment_id, status: pending",
          },
        ],
      },
    },
    {
      term: "A database row, and its \"state\"",
      plain:
        "Each payment is one row in a table, and that row has a status that changes over time — it starts \"pending,\" then moves to either \"processed\" or \"failed\" once the real work happens.",
      visual: {
        kind: "state-machine",
        viewBox: "0 0 340 180",
        initialId: "pending",
        states: [
          { id: "pending", label: "pending", description: "The row FastAPI writes immediately, before any real processing has happened.", x: 60, y: 90 },
          { id: "processed", label: "processed", description: "The consumer successfully updated the balance and marked this payment done.", x: 250, y: 40 },
          { id: "failed", label: "failed", description: "Something went wrong while processing — the event was routed to the dead-letter queue.", x: 250, y: 140 },
        ],
        transitions: [
          { from: "pending", to: "processed", label: "consumer succeeds" },
          { from: "pending", to: "failed", label: "consumer errors" },
        ],
      },
    },
    {
      term: "Asynchronous processing, and why decouple it from the request",
      plain:
        "Synchronous means the client waits until all the work is done. Asynchronous means the server does the minimum to acknowledge the request, then finishes the real work later — so a slow downstream step doesn't make every client wait for it.",
      visual: {
        kind: "side-by-side",
        leftLabel: "Synchronous",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "c1", label: "Client", col: 0 },
            { id: "s1", label: "Server does everything, then responds", col: 1 },
          ],
          edges: [{ from: "c1", to: "s1", direction: "both", label: "waits the whole time" }],
        },
        rightLabel: "Asynchronous (what was built)",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "c2", label: "Client", col: 0 },
            { id: "s2", label: "Server queues it, responds fast", col: 1 },
          ],
          edges: [{ from: "c2", to: "s2", direction: "both", label: "gets an ack immediately" }],
        },
      },
    },
    {
      term: "Message queue",
      plain:
        "A message queue (this project uses Apache Kafka) is like a mail room: the sender drops a message and moves on, and a separate reader picks it up whenever it's ready — the two sides never have to be available at the same moment.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "p", label: "Producer (API)", col: 0 },
          { id: "q", label: "Kafka: payment-events", col: 1 },
          { id: "c", label: "Consumer", col: 2 },
        ],
        edges: [
          { from: "p", to: "q", label: "drops message" },
          { from: "q", to: "c", label: "picked up later" },
        ],
      },
    },
    {
      term: "\"At least once\" delivery, and why duplicates happen",
      plain:
        "Kafka guarantees a message won't be lost — but that guarantee comes with a catch: if a consumer crashes before confirming it finished, Kafka will deliver that same message again, on the assumption it's safer to risk a duplicate than to risk losing it.",
      visual: {
        kind: "timeline",
        totalDuration: 6,
        unit: "s",
        segments: [
          { id: "d1", label: "message #482 delivered", start: 0, duration: 0, color: "default", description: "The consumer receives event #482 and starts processing it." },
          { id: "crash", label: "consumer crashes mid-process", start: 1.5, duration: 0, color: "fail", description: "The process dies before it ever tells Kafka \"I'm done with this one.\"" },
          { id: "redeliver", label: "Kafka redelivers #482", start: 5, duration: 0, color: "wait", description: "Since no offset was ever committed, Kafka assumes the message wasn't handled and sends it again — to whichever consumer picks it up next." },
        ],
      },
    },
    {
      term: "Idempotency",
      plain:
        "Idempotency means handling the same message twice causes no extra effect — like a light switch already on staying on if you flip \"on\" again. It's what makes redelivery, above, safe instead of dangerous.",
      visual: {
        kind: "table",
        columns: ["event_id", "insert result"],
        states: [
          {
            label: "1st delivery",
            rows: [{ cells: ["evt_482", "inserted"], highlight: "success" }],
            note: "A new event ID — the insert succeeds, and processing continues normally.",
          },
          {
            label: "redelivered (duplicate)",
            rows: [{ cells: ["evt_482", "rejected — already exists"], highlight: "reject" }],
            note: "Same event ID — the database itself refuses the duplicate insert, so the consumer knows to stop before touching any balance.",
          },
        ],
      },
    },
    {
      term: "Dead-letter queue (DLQ)",
      plain:
        "When processing a message throws an error, a dead-letter queue is a separate holding area it gets moved to instead of crashing the consumer or vanishing silently — so one bad message doesn't block every payment behind it.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "consumer", label: "Consumer", col: 0, row: 0 },
          { id: "success", label: "Balance updated", col: 1, row: 0 },
          { id: "dlq", label: "Dead-letter queue", col: 1, row: 1 },
        ],
        edges: [
          { from: "consumer", to: "success", label: "on success" },
          { from: "consumer", to: "dlq", label: "on failure", style: "dashed" },
        ],
      },
    },
  ],

  overview: [
    "When a payment request comes in, the API does the bare minimum to respond fast: write a `pending` row to Postgres and drop a message describing the payment onto a Kafka topic, then return immediately. A separate consumer process picks that message up whenever it's ready, updates the real balance, and marks the payment `processed` — or `failed`, with the message rerouted to a dead-letter queue instead of vanishing.",
    "The interesting problem isn't the happy path — it's what happens when Kafka redelivers a message the consumer already handled, or when the database write and the Kafka publish don't happen as one atomic unit, which turns out to be a real, still-open gap in the current code rather than something already solved (covered honestly in the failure scenario below).",
  ],

  diagram: {
    viewBox: "0 0 900 320",
    nodes: [
      { id: "client", label: "Client", x: 20, y: 130, width: 130 },
      { id: "api", label: "FastAPI /payments", x: 200, y: 130, width: 180 },
      { id: "postgres", label: "PostgreSQL", x: 440, y: 30, width: 150 },
      { id: "kafka", label: "Kafka: payment-events", x: 440, y: 230, width: 190 },
      { id: "consumer", label: "Payment Consumer", x: 680, y: 230, width: 170 },
      { id: "dlq", label: "DLQ: payment-events-dlq", x: 680, y: 30, width: 190 },
    ],
    edges: [
      { from: "client", to: "api", label: "POST /payments" },
      { from: "api", to: "postgres", label: "insert pending" },
      { from: "api", to: "kafka", label: "produce event" },
      { from: "kafka", to: "consumer", label: "poll" },
      { from: "consumer", to: "postgres", label: "update processed" },
      { from: "consumer", to: "dlq", label: "on failure", dashed: true },
    ],
    details: {
      client: {
        title: "Client",
        plain: "Whoever's making a payment request — in this project, a load-test script that fires 1,000 requests to prove the pipeline holds up under volume.",
      },
      api: {
        title: "FastAPI — POST /payments",
        plain: "The one public entry point. It does two things and then returns immediately: writes a `pending` payment row to Postgres, and publishes an event describing that payment to Kafka. It does not wait for the payment to actually be processed.",
        techDetail: "api/main.py:23-71. Validates user_id starts with \"user_\" (400 if not). Insert + commit happen before produce_event() is called.",
      },
      postgres: {
        title: "PostgreSQL",
        plain: "Where every payment's current status lives — pending, processed, or failed — plus a table that remembers every event ID already handled, which is what makes the system safe against duplicate messages.",
        techDetail: "3 relevant tables: payments (status is a plain TEXT column, no enum/CHECK constraint), users (balance, decremented per payment), processed_events (event_id PRIMARY KEY, used for the idempotency check).",
      },
      kafka: {
        title: "Kafka topic: payment-events",
        plain: "The \"mail room\" — a named channel the API drops payment events onto, and the consumer reads from independently, at its own pace.",
        techDetail: "4 partitions, replication factor 1 (local-dev config). Only Kafka and Postgres are containerized (docker-compose.yml) — the API and both consumers always run as bare Python processes; this repo has no Dockerfile and no CI/CD workflow at all.",
      },
      consumer: {
        title: "Payment Consumer",
        plain: "A separate, always-running process that reads payment events one at a time, checks it hasn't already handled this exact event, updates the real balance and payment status, and only then tells Kafka \"I'm done with this message.\"",
        techDetail: "consumer/payment_consumer.py. enable.auto.commit is explicitly set to False — the offset is only committed after process_event() returns successfully, or after a failed event has been safely handed off to the DLQ.",
      },
      dlq: {
        title: "Dead-letter queue: payment-events-dlq",
        plain: "Where a payment event goes if processing it throws an error — instead of crashing the whole consumer or silently dropping the message, it's set aside on its own channel with the error attached.",
        techDetail: "The DLQ topic is never explicitly created with a partition count (kafka/setup_topics.py only provisions the main topic) — it only exists via the broker's default auto-topic-creation. The DLQ consumer also doesn't do manual offset commits like the main consumer, and currently does nothing with a DLQ message except log it.",
      },
    },
  },

  flow: [
    { title: "A payment request comes in", plain: "POST /payments arrives with a user ID and an amount. The user ID has to start with \"user_\" or the request is rejected outright with a 400 error." },
    { title: "The database write happens first, and commits immediately", plain: "A new payment row is written to Postgres with status \"pending\" and committed right away — this row now permanently exists, regardless of anything that happens next." },
    { title: "Only then does the event get published to Kafka", plain: "After the database commit, the API builds an event describing the payment and publishes it to Kafka — a separate, later step, not part of the same all-or-nothing transaction." },
    { title: "The API responds — without knowing whether processing will ever happen", plain: "The client gets back a payment_id and status \"pending.\" The API's job is done; it has no further involvement in whether this payment ever actually gets processed." },
    { title: "The consumer picks the event up, whenever it's ready", plain: "A separate, always-running process reads the event off Kafka — possibly seconds or minutes later, at its own pace." },
    { title: "Duplicate protection happens before anything else changes", plain: "Before touching any balance, the consumer tries to insert this event's ID into a table that only accepts each ID once. If rejected, it knows it's seen this event before and stops — no balance gets touched twice." },
    { title: "The offset is committed last, only once everything above succeeded", plain: "Only after the transaction fully commits does the consumer tell Kafka \"I've handled this message.\" A crash before this line means Kafka would redeliver it — exactly why the duplicate check exists." },
  ],

  decisions: [
    {
      title: "Manual offset commits, not Kafka's auto-commit",
      plain: "The consumer explicitly turns off Kafka's automatic \"mark this as read\" behavior, and instead tells Kafka \"I'm done with this message\" by hand, only after the work is actually finished.",
      alternative: "Leave Kafka's default auto-commit on, which marks a message as read on a timer, regardless of whether your code actually finished processing it.",
      tradeoff: "Auto-commit can mark a message \"done\" before your code finished with it — a crash in that window loses the message forever. Manual commits mean a bit more code for a real guarantee.",
      ifReversed: "A crash between \"Kafka marked this read\" and \"the code actually finished\" would silently lose that payment — never reprocessed, nothing flagging it happened.",
      techDetail: "consumer/payment_consumer.py:149, `\"enable.auto.commit\": False`. The offset commit itself happens at line 190 (success) or 211 (after DLQ hand-off) — always after the outcome is known.",
      comparisonVisual: {
        kind: "side-by-side",
        leftLabel: "Auto-commit (Kafka default)",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "r1", label: "Message received", col: 0 },
            { id: "m1", label: "Marked read immediately", col: 1 },
            { id: "p1", label: "Processing (may crash here)", col: 2 },
          ],
          edges: [
            { from: "r1", to: "m1" },
            { from: "m1", to: "p1", style: "dashed" },
          ],
        },
        rightLabel: "Manual commit (what was built)",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "r2", label: "Message received", col: 0 },
            { id: "p2", label: "Processing finishes", col: 1 },
            { id: "m2", label: "Marked read now", col: 2 },
          ],
          edges: [
            { from: "r2", to: "p2" },
            { from: "p2", to: "m2" },
          ],
        },
      },
    },
    {
      title: "Real, database-enforced idempotency — not just an in-memory check",
      plain: "Duplicate messages are a certainty in a system like this, not an edge case. Before doing anything else, the consumer tries to insert the event's ID into a table where each ID can only exist once, and treats a rejected insert as \"already done.\"",
      alternative: "Check an in-memory set or cache of \"already processed\" IDs instead of a real database constraint.",
      tradeoff: "An in-memory check is faster, but forgets everything on restart and breaks with more than one consumer process — the database check survives both.",
      ifReversed: "Without a real, persistent uniqueness check, a redelivered message would run the balance update a second time — a silent double-charge.",
      techDetail: "`INSERT INTO processed_events (event_id) VALUES (%s) ON CONFLICT (event_id) DO NOTHING`, then checking `cursor.rowcount == 0`. There's a second safety net too: the later UPDATE marking a payment \"processed\" only matches rows still in \"pending\" status.",
    },
    {
      title: "The database write and the Kafka publish are two separate steps, not one atomic unit",
      plain: "This is the most honest thing to say about this design: the payment gets written and committed *before* the event is published to Kafka, as two separate steps with nothing tying them together.",
      alternative: "An \"outbox\" pattern — write the event to the same database, in the same transaction as the payment row, then relay it to Kafka separately.",
      tradeoff: "The outbox pattern is more robust but meaningfully more machinery. What's shipped is simpler, and honest about the tradeoff: a Kafka publish failure after the DB commit leaves an orphaned \"pending\" payment with no automatic recovery.",
      ifReversed: "This isn't really reversible without adding the outbox machinery — the risk described is the direct, current consequence of not having it yet.",
      techDetail: "api/main.py:41-57 — conn.commit() happens before produce_event() is called. produce_event calls producer.flush() with no timeout, which can block indefinitely if Kafka is unreachable.",
      comparisonVisual: {
        kind: "side-by-side",
        leftLabel: "What's shipped",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "db1", label: "DB commit", col: 0 },
            { id: "kf1", label: "Kafka publish", col: 1 },
          ],
          edges: [{ from: "db1", to: "kf1", label: "separate step, can fail on its own", style: "dashed" }],
        },
        rightLabel: "Outbox pattern (not built)",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "db2", label: "DB commit + outbox row", col: 0 },
            { id: "relay", label: "Relay process", col: 1 },
            { id: "kf2", label: "Kafka publish", col: 2 },
          ],
          edges: [
            { from: "db2", to: "relay" },
            { from: "relay", to: "kf2" },
          ],
        },
      },
    },
    {
      title: "A dead-letter queue that separates failures cleanly — but doesn't yet close the loop on them",
      plain: "When something goes wrong processing a payment, the event is moved to its own channel with the error attached, instead of crashing the consumer or getting silently dropped.",
      alternative: "Build the full second half too: give the DLQ topic explicit partitions, and have its consumer actually store failed events somewhere reviewable and reprocessable.",
      tradeoff: "Shipping \"quarantine failures separately\" first protects the main stream immediately. The reprocessing half is real additional work that hasn't been built yet.",
      ifReversed: "Without even the current DLQ, a processing failure would either crash the whole consumer or silently disappear with no record at all.",
      techDetail: "The DLQ topic is never explicitly provisioned with a partition count — it exists only via Kafka's default auto-create. consumer/dlq_consumer.py doesn't set enable.auto.commit to False like the main consumer, and its handling of a DLQ message is currently just a log line.",
    },
    {
      title: "Bare processes, not containers or a CI/CD pipeline",
      plain: "Unlike some of my other projects, the API and both consumers here run as plain Python processes, not inside Docker, and there's no automated deploy pipeline for this repo at all.",
      alternative: "Containerize the API and consumers and wire up a CI/CD workflow, the way the RAG and gRPC projects do.",
      tradeoff: "This project's focus was the messaging and consistency patterns themselves, not deployment tooling — a real, current limitation, listed honestly rather than implied otherwise.",
      ifReversed: "N/A — this reflects what exists today, not a design choice being defended as ideal.",
    },
  ],

  failureScenario: {
    title: "When the database commit succeeds but the Kafka publish doesn't",
    intro: "Not every failure here is a crash mid-consumer — this one is quieter and happens entirely inside the very first request, before a consumer is even involved.",
    steps: [
      { title: "1. A payment request arrives", plain: "A client sends POST /payments. FastAPI validates the user_id format and opens a database connection." },
      { title: "2. The payment row is written and committed", plain: "A new row goes into the payments table with status \"pending,\" and the transaction commits. This payment now permanently exists in the system's records." },
      { title: "3. The API tries to publish the event to Kafka", plain: "Next, the API builds the event payload and calls Kafka's producer to send it — then waits (via flush()) for delivery to be confirmed." },
      { title: "4. Kafka is unreachable, or the publish is slow enough to matter", plain: "Suppose the broker is down, or the producer's buffer is full. The publish either raises an error, or — since flush() has no timeout — hangs indefinitely." },
      { title: "5. If it raises: the API returns an error — but the damage is already done", plain: "The code catches the exception and rolls back — a no-op, since the payment row was already committed in step 2. The API returns a 500 error." },
      { title: "6. What the client sees vs. what actually happened", plain: "The client sees a failed request and reasonably assumes the payment was never created. But the row does exist, sitting in \"pending,\" with no Kafka event ever published for it." },
      { title: "7. The end state", plain: "That payment is stuck permanently at \"pending\" — no consumer will ever see it, and no existing code path notices or recovers it. This is exactly the gap the outbox-pattern decision above is about." },
    ],
  },

  pathComparison: {
    title: "Two views of the same consumer",
    visual: {
      kind: "side-by-side",
      leftLabel: "Happy path",
      left: {
        kind: "pipeline",
        nodes: [
          { id: "h1", label: "Event arrives", col: 0 },
          { id: "h2", label: "Processed successfully", col: 1 },
          { id: "h3", label: "Offset committed", col: 2 },
        ],
        edges: [
          { from: "h1", to: "h2" },
          { from: "h2", to: "h3" },
        ],
      },
      rightLabel: "Failure path",
      right: {
        kind: "pipeline",
        nodes: [
          { id: "f1", label: "Event arrives", col: 0 },
          { id: "f2", label: "Error, transaction rolled back", col: 1 },
          { id: "f3", label: "Sent to DLQ, offset committed", col: 2 },
        ],
        edges: [
          { from: "f1", to: "f2" },
          { from: "f2", to: "f3" },
        ],
      },
      caption:
        "Either the whole transaction commits and the offset is marked done, or none of it does and the event is safely quarantined instead — there's no in-between state.",
    },
  },

  codeSnippets: [
    {
      title: "The idempotent insert",
      lang: "python",
      code: `cursor.execute("""
    INSERT INTO processed_events (event_id) VALUES (%s)
    ON CONFLICT (event_id) DO NOTHING
""", (event_id,))
if cursor.rowcount == 0:
    return  # already handled this exact event`,
      explanation:
        "A genuinely atomic, database-enforced duplicate check — not a check-then-insert race, since the conflict handling is built into the single INSERT itself.",
    },
    {
      title: "Where the DB commit and Kafka publish diverge",
      lang: "python",
      code: `conn.commit()          # payment row now permanently exists
produce_event(event)   # separate step — can still fail on its own`,
      explanation:
        "The exact ordering behind the failure scenario above — two independent steps with nothing tying them together.",
    },
  ],

  futureWork: [
    "Close the database/Kafka consistency gap — either an outbox pattern or a reconciliation job that finds \"pending\" payments with no matching Kafka event and retries or flags them",
    "Explicitly provision the DLQ topic with a real partition count instead of relying on broker auto-create",
    "Give the DLQ consumer an actual reprocessing path — persist failed events somewhere reviewable, instead of only logging them",
    "Add configurable retry with backoff before an event is routed to the DLQ at all, instead of failing straight to it on the first error",
    "Add real observability — structured logging, metrics, tracing — since right now the only visibility into consumer health is log lines",
    "Add a real payment-gateway simulator to validate balances against, instead of balance-as-bookkeeping with no floor at zero",
  ],

  glossary: [
    { term: "Kafka / message queue", definition: "A system for passing messages between parts of an application without them talking to each other directly — like a mail room that holds letters until someone's free to open them." },
    { term: "Topic", definition: "A named channel in Kafka that messages get published to and read from — this project uses one for new payments and a separate one for failed payments." },
    { term: "Consumer", definition: "A process that reads messages off a Kafka topic." },
    { term: "Offset", definition: "Kafka's bookmark of how far a consumer has read in a topic — committing an offset means telling Kafka \"I've handled everything up to here.\"" },
    { term: "Idempotency", definition: "A system's ability to handle the exact same request or message more than once without it causing extra, unwanted effects." },
    { term: "Dead-letter queue (DLQ)", definition: "A separate holding area for messages that failed to process, so they're set aside for review instead of crashing the system or vanishing." },
    { term: "Transaction", definition: "A group of database operations that either all succeed together or all get undone together — no in-between state." },
  ],
};
