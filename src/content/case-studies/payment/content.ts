import type { PaymentCaseStudyContent } from "./types";

// All facts here trace to the same repo research behind the original
// generic write-up (file:line citations preserved in `techDetail` fields
// and `code` snippets) — this is a presentation redesign around a
// "Payment Reliability Lab" framing, not a re-research pass. The three
// consumer-scaling benchmark numbers are measured results from this
// project; no runtime for 6 consumers is invented (there is none — that
// option exists only to show the partition ceiling).
export const paymentCaseStudy: PaymentCaseStudyContent = {
  hook:
    "The happy path is simple: accept a payment, publish an event, process it. The harder question is what happens when only half of that sequence succeeds.",
  subhook:
    "I built this system to explore event-driven payment processing with Kafka, then started deliberately testing the assumptions underneath it: duplicate delivery, consumer crashes, offset handling, failed events, and the gap between PostgreSQL and Kafka.",

  prerequisites: {
    title: "Before you dive in",
    intro:
      "This write-up assumes familiarity with basic HTTP APIs, relational databases, database transactions, and asynchronous processing. I skip introductory explanations of those ideas and focus on the concepts that matter specifically to this system.",
    chips: ["HTTP APIs", "SQL / PostgreSQL", "Transactions", "Basic async processing"],
    kafkaNote:
      "Kafka-specific ideas — partitions, consumer groups, offsets, delivery semantics, idempotency, dead-letter queues — are explained where they affect the design.",
  },

  learningOutcomes: {
    title: "What you'll understand",
    items: [
      "Why Kafka consumers may see the same event more than once",
      "Why offset commits and database transactions must be coordinated carefully",
      "Why writing to PostgreSQL and publishing to Kafka creates a partial-failure problem",
    ],
  },

  invariants: {
    title: "What must remain true?",
    items: [
      {
        title: "Duplicate safety",
        statement: "The same event ID must not change account state twice.",
        status: "protected",
        statusLabel: "Protected in current system",
      },
      {
        title: "Acknowledgement safety",
        statement:
          "Kafka should not be told that processing succeeded before the database work succeeds.",
        status: "protected",
        statusLabel: "Protected in current system",
      },
      {
        title: "Failure visibility",
        statement:
          "A processing error should remain discoverable instead of disappearing silently.",
        status: "protected",
        statusLabel: "Protected through DLQ",
      },
      {
        title: "DB → Kafka consistency",
        statement:
          "A payment committed to PostgreSQL should not become permanently invisible to downstream processing.",
        status: "gap",
        statusLabel: "Known gap",
      },
    ],
  },

  architecture: {
    title: "What exists today",
    intro: "Click a component to see what it owns.",
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
        plain:
          "Whoever's making a payment request — in this project, a load-test script that fires 1,000 requests to prove the pipeline holds up under volume.",
      },
      api: {
        title: "FastAPI — POST /payments",
        plain:
          "Owns the entry point. Writes the initial pending payment row to Postgres, then produces the payment event to Kafka — and returns immediately, without waiting for processing to finish.",
        techDetail:
          "api/main.py:23-71. Validates user_id starts with \"user_\" (400 if not). The DB insert commits before produce_event() is called.",
      },
      postgres: {
        title: "PostgreSQL",
        plain:
          "Owns payment state (pending/processed/failed) and stores every processed event ID, which is what enforces duplicate protection.",
        techDetail:
          "3 relevant tables: payments (status is a plain TEXT column, no enum/CHECK constraint), users (balance, decremented per payment), processed_events (event_id PRIMARY KEY — the idempotency check).",
      },
      kafka: {
        title: "Kafka topic: payment-events",
        plain:
          "Holds payment events for asynchronous processing, splits them across partitions, and tracks each consumer's progress via offsets.",
        techDetail:
          "4 partitions, replication factor 1 (local-dev config). Only Kafka and Postgres are containerized (docker-compose.yml) — the API and both consumers run as bare Python processes; no Dockerfile, no CI/CD in this repo.",
      },
      consumer: {
        title: "Payment Consumer",
        plain:
          "Reads events, performs the actual payment processing, and commits its Kafka offset only after that work succeeds.",
        techDetail:
          "consumer/payment_consumer.py. enable.auto.commit is explicitly False — the offset commits only after process_event() returns successfully, or after a failed event is safely handed to the DLQ.",
      },
      dlq: {
        title: "Dead-letter queue: payment-events-dlq",
        plain:
          "Isolates processing failures on their own topic instead of crashing the consumer or silently dropping the message.",
        techDetail:
          "Never explicitly provisioned with a partition count — it exists only via the broker's default auto-topic-creation. Its consumer doesn't disable auto-commit like the main consumer, and currently just logs a DLQ message rather than storing or reprocessing it.",
      },
    },
    caption:
      "payment-events has 4 partitions; today's consumer group runs a single consumer covering all of them — see the scaling section below for why that number matters.",
  },

  failureLab: {
    title: "Now break the system",
    subtitle: "Select a failure and follow the same payment through the consequences.",
    scenarios: [
      {
        id: "duplicate",
        tabLabel: "Duplicate delivery after a crash",
        title: "Consumer crashes before committing the offset",
        steps: [
          {
            title: "Kafka delivers evt_482",
            plain: "The consumer's poll loop receives the event and begins processing it.",
          },
          {
            title: "Database work succeeds",
            plain:
              "The consumer updates the account balance and marks the payment processed, inside a transaction that commits.",
          },
          {
            title: "The consumer crashes before committing the offset",
            plain:
              "The process dies right after the database transaction commits, but before it tells Kafka \"I'm done with this message.\"",
          },
          {
            title: "Kafka redelivers evt_482",
            plain:
              "Since no offset was ever committed for this message, Kafka assumes it wasn't handled and delivers it again to whichever consumer picks it up next.",
          },
          {
            title: "The consumer tries to register the event ID again",
            plain:
              "Before touching any balance, the consumer runs the same insert into processed_events it always runs first.",
          },
          {
            title: "PostgreSQL's uniqueness constraint catches it",
            plain:
              "The insert affects zero rows — the event ID already exists — so the consumer recognizes this as a duplicate and stops before the balance is touched a second time.",
          },
        ],
        visual: {
          kind: "timeline",
          totalDuration: 6.5,
          unit: "s",
          segments: [
            {
              id: "delivered",
              label: "evt_482 delivered",
              start: 0,
              duration: 0,
              color: "default",
              description: "First delivery. The consumer begins processing the event.",
            },
            {
              id: "dbwrite",
              label: "DB write commits",
              start: 1,
              duration: 0,
              color: "default",
              description: "Balance updated, payment marked processed — the transaction commits.",
            },
            {
              id: "crash",
              label: "consumer crashes",
              start: 1.6,
              duration: 0,
              color: "fail",
              description:
                "The process dies before it ever tells Kafka \"I'm done with this one\" — the offset was never committed.",
            },
            {
              id: "redeliver",
              label: "Kafka redelivers",
              start: 4.5,
              duration: 0,
              color: "wait",
              description:
                "With no offset committed, Kafka assumes evt_482 wasn't handled and sends it again.",
            },
            {
              id: "dedup",
              label: "duplicate rejected",
              start: 5.2,
              duration: 0,
              color: "success",
              description:
                "The processed_events insert affects zero rows — the consumer stops before touching the balance again.",
            },
          ],
        },
        explanationTitle: "Why this is safe",
        explanation:
          "The important protection isn't \"Kafka only delivers once.\" Kafka can durably retain events and consumers track progress through offsets, but with this consumer design, a crash before the relevant offset is committed can cause the event to be delivered again — which is why processing must be idempotent. The actual protection is that the consumer is designed to tolerate seeing the same event more than once, enforced by the event_id uniqueness check in PostgreSQL.",
        code: {
          title: "The idempotent insert",
          lang: "python",
          code: `cursor.execute("""
    INSERT INTO processed_events (event_id) VALUES (%s)
    ON CONFLICT (event_id) DO NOTHING
""", (event_id,))
if cursor.rowcount == 0:
    return  # already handled this exact event`,
          explanation:
            "The duplicate check is database-enforced in one atomic statement — not a separate check-then-insert sequence that could race.",
        },
      },
      {
        id: "processing-error",
        tabLabel: "Consumer throws an error",
        title: "Consumer throws an error",
        steps: [
          {
            title: "Consumer receives a payment event",
            plain: "A normal event arrives off the payment-events topic.",
          },
          {
            title: "Processing fails",
            plain:
              "An exception is raised partway through handling — malformed event data, a downstream error, anything that isn't the happy path.",
          },
          {
            title: "The database transaction rolls back where applicable",
            plain: "Any partial writes for this event are undone — nothing half-updates.",
          },
          {
            title: "The event is published to the dead-letter queue",
            plain:
              "Instead of crashing the consumer or dropping the message, it's moved to payment-events-dlq with its error context.",
          },
          {
            title: "The main consumer continues processing other events",
            plain:
              "The offset for the failed message is committed after the DLQ hand-off, so this one failure doesn't block everything behind it.",
          },
        ],
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
        explanationTitle: "What this buys you",
        explanation:
          "Failure isolation keeps one bad event visible without allowing it to silently disappear or block the normal processing path.",
        limitation:
          "The current DLQ flow does not yet provide a complete operational reprocessing workflow — the DLQ consumer logs the failed message but doesn't store it anywhere reviewable or retry it automatically.",
      },
      {
        id: "dual-write",
        tabLabel: "API crashes between PostgreSQL and Kafka",
        title: "API crashes between PostgreSQL and Kafka",
        steps: [
          {
            title: "Client submits a payment",
            plain: "POST /payments arrives and FastAPI opens a database connection.",
          },
          {
            title: "FastAPI commits the payment row to PostgreSQL",
            plain:
              "A pending row is written and the transaction commits — this payment now permanently exists in the system's records.",
          },
          {
            title: "The application crashes, or the Kafka publish fails",
            plain:
              "Say the broker is unreachable, or the producer's buffer is full — flush() has no timeout, so this can also hang indefinitely instead of failing fast.",
          },
          {
            title: "The Kafka publish never happens",
            plain: "No event is ever produced to payment-events for this payment.",
          },
          {
            title: "PostgreSQL contains the payment; Kafka contains no corresponding event",
            plain: "The two systems now disagree about whether this payment exists.",
          },
          {
            title: "The consumer never sees it",
            plain: "There is no event to poll, so no consumer process ever touches this payment.",
          },
        ],
        visual: {
          kind: "splitbrain",
          left: { label: "PostgreSQL", state: "payment exists" },
          right: { label: "Kafka", state: "event missing" },
          takeaway: "The database knows about the payment. Kafka doesn't.",
        },
        explanationTitle: "The dual-write problem",
        explanation:
          "This is the classic dual-write problem: two independent systems — Postgres and Kafka — are both supposed to reflect the same event, but nothing ties their two writes together into one atomic operation. Success in one doesn't guarantee success in the other.",
        gapLabel: "KNOWN GAP IN CURRENT IMPLEMENTATION",
        code: {
          title: "Where the DB commit and Kafka publish diverge",
          lang: "python",
          code: `conn.commit()          # payment row now permanently exists
produce_event(event)   # separate step — can still fail on its own`,
          explanation:
            "Two independent operations. Success of the first does not guarantee success of the second — see the dedicated section below for what closes this gap.",
        },
      },
    ],
  },

  mechanisms: {
    title: "Which failure does this protect against?",
    items: [
      {
        title: "Idempotent event processing",
        protectsAgainst: "duplicate / redelivered Kafka event",
        mechanism: "event_id + PostgreSQL UNIQUE constraint",
        note: "The system doesn't try to prevent Kafka from ever redelivering. It makes redelivery safe.",
      },
      {
        title: "Manual offset commits",
        protectsAgainst: "acknowledging unfinished work",
        mechanism: "commit the Kafka offset only after processing succeeds",
      },
      {
        title: "Database transactions",
        protectsAgainst: "partial database changes",
        mechanism:
          "the balance update and payment-status update commit or roll back together, as one atomic unit",
      },
      {
        title: "Dead-letter queue",
        protectsAgainst: "a failed event disappearing, or repeatedly breaking the normal path",
        mechanism: "route the failed event to a separate topic instead of retrying it forever inline",
        doesNotSolve: ["investigation", "correction", "safe reprocessing"],
      },
    ],
  },

  consumerScaling: {
    title: "How much parallelism do four partitions actually give me?",
    subtitle: "Pick a consumer count and watch which partitions each one owns.",
    partitionCount: 4,
    consumerOptions: [1, 3, 4, 6],
    measured: [
      { consumers: 1, seconds: 16.11 },
      { consumers: 3, seconds: 8.03 },
      { consumers: 4, seconds: 6.73 },
    ],
    measuredLabel: "1,000 simulated payment events, 4-partition topic",
    disclaimer: "This is a learning benchmark from this project, not a production throughput claim.",
    takeaway:
      "Within one consumer group, useful parallelism is bounded by partition count — a 5th or 6th consumer in the same group just sits idle.",
  },

  dualWrite: {
    title: "The hardest failure is between two systems",
    currentLabel: "Current implementation",
    currentDiagram: "commit payment in PostgreSQL\n        │\n        ▼\npublish event to Kafka",
    currentNote:
      "Nothing ties these two steps together — a failure between them leaves a payment PostgreSQL knows about and Kafka never will.",
    nextLabel: "Possible next direction: transactional outbox",
    nextDiagram:
      "ONE PostgreSQL transaction\n├── payment row\n└── outbox event row\n\noutbox publisher\n        │\n        ▼\n      Kafka",
    nextStatusLabel: "NOT YET IMPLEMENTED",
    nextNote:
      "Writing the payment and its outbox event in the same transaction means either both exist or neither does — a separate publisher process then relays outbox rows to Kafka.",
    tradeoffNote:
      "This closes the window described above, but adds a new moving part (the publisher) with its own failure mode — duplicate publication if the publisher crashes after sending but before marking a row relayed, so consumers still need to tolerate duplicates either way.",
    reconciliationNote:
      "A simpler, complementary option is a periodic reconciliation job: scan for payments stuck in pending with no matching Kafka event, and flag or retry them — no new write path, just a safety net over the existing one.",
    lesson:
      "Reliability patterns move the failure boundary. They do not make distributed systems magically failure-free.",
  },

  decisions: [
    {
      title: "Manual offset commits, not Kafka's auto-commit",
      plain:
        "The consumer explicitly turns off Kafka's automatic \"mark this as read\" behavior, and instead tells Kafka \"I'm done with this message\" by hand, only after the work is actually finished.",
      alternative:
        "Leave Kafka's default auto-commit on, which marks a message as read on a timer, regardless of whether your code actually finished processing it.",
      tradeoff:
        "Auto-commit can mark a message \"done\" before your code finished with it — a crash in that window loses the message forever. Manual commits mean a bit more code for a real guarantee.",
      ifReversed:
        "A crash between \"Kafka marked this read\" and \"the code actually finished\" would silently lose that payment — never reprocessed, nothing flagging it happened.",
      techDetail:
        "consumer/payment_consumer.py:149, \"enable.auto.commit\": False. The offset commit itself happens at line 190 (success) or 211 (after DLQ hand-off) — always after the outcome is known.",
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
      plain:
        "Duplicate messages are a certainty in a system like this, not an edge case. Before doing anything else, the consumer tries to insert the event's ID into a table where each ID can only exist once, and treats a rejected insert as \"already done.\"",
      alternative:
        "Check an in-memory set or cache of \"already processed\" IDs instead of a real database constraint.",
      tradeoff:
        "An in-memory check is faster, but forgets everything on restart and breaks with more than one consumer process — the database check survives both.",
      ifReversed:
        "Without a real, persistent uniqueness check, a redelivered message would run the balance update a second time — a silent double-charge.",
      techDetail:
        "INSERT INTO processed_events (event_id) VALUES (%s) ON CONFLICT (event_id) DO NOTHING, then checking cursor.rowcount == 0. There's a second safety net too: the later UPDATE marking a payment \"processed\" only matches rows still in \"pending\" status.",
    },
    {
      title: "A dead-letter queue that separates failures cleanly — but doesn't yet close the loop on them",
      plain:
        "When something goes wrong processing a payment, the event is moved to its own channel with the error attached, instead of crashing the consumer or getting silently dropped.",
      alternative:
        "Build the full second half too: give the DLQ topic explicit partitions, and have its consumer actually store failed events somewhere reviewable and reprocessable.",
      tradeoff:
        "Shipping \"quarantine failures separately\" first protects the main stream immediately. The reprocessing half is real additional work that hasn't been built yet.",
      ifReversed:
        "Without even the current DLQ, a processing failure would either crash the whole consumer or silently disappear with no record at all.",
      techDetail:
        "The DLQ topic is never explicitly provisioned with a partition count — it exists only via Kafka's default auto-create. consumer/dlq_consumer.py doesn't set enable.auto.commit to False like the main consumer, and its handling of a DLQ message is currently just a log line.",
    },
  ],

  futureWork: {
    title: "Open problems I want to test next",
    items: [
      "Close the PostgreSQL/Kafka consistency gap — either the transactional outbox above or a reconciliation job",
      "Give the DLQ consumer an actual reprocessing path, and explicitly provision its topic's partition count",
      "Add configurable retry with backoff before an event is routed to the DLQ at all",
      "Add real, structured observability — logging, metrics, tracing — since right now the only visibility into consumer health is log lines",
      "Add a real payment-gateway simulator to validate balances against, instead of balance-as-bookkeeping with no floor at zero",
      "Push harder on failure testing — broker restarts mid-batch, slow consumers, poison-pill events",
    ],
  },

  glossary: [
    {
      term: "Partition",
      definition:
        "A Kafka topic is split into an ordered, independent log per partition — order is preserved within one partition, not guaranteed across partitions.",
    },
    {
      term: "Consumer group",
      definition:
        "A named set of consumers sharing the work of reading a topic — Kafka guarantees each partition is owned by exactly one consumer in the group at a time.",
    },
    {
      term: "Offset",
      definition:
        "Kafka's bookmark of how far a consumer has read in a partition — committing an offset means telling Kafka \"I've handled everything up to here.\"",
    },
    {
      term: "Idempotency",
      definition:
        "A system's ability to handle the exact same request or message more than once without it causing extra, unwanted effects.",
    },
    {
      term: "Dead-letter queue (DLQ)",
      definition:
        "A separate topic that failed messages are routed to, so they're set aside for review instead of crashing the consumer or vanishing.",
    },
    {
      term: "Dual-write problem",
      definition:
        "The risk of writing related data to two independent systems with no shared transaction — one write can succeed while the other fails, leaving them out of sync.",
    },
    {
      term: "Transactional outbox",
      definition:
        "A pattern where the event to publish is written in the same database transaction as the primary write, then relayed to the broker by a separate process — so the two writes can't diverge.",
    },
  ],
};
