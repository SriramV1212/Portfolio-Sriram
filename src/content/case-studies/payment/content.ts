import type { PaymentCaseStudyContent } from "./types";

// All facts here trace to the same repo research behind the original
// write-up (file:line citations preserved in `techDetail` fields and
// `code` snippets) — this is an editorial pass toward a long-form article
// structure, not a re-research pass. The consumer-scaling benchmark
// numbers are measured results from this project; no runtime for 6
// consumers is invented — that option exists only to show the partition
// ceiling. Wording around Kafka's durability/delivery guarantees is
// deliberately qualified rather than absolute (see the Failure Lab and
// reliability sections below).
export const paymentCaseStudy: PaymentCaseStudyContent = {
  hook:
    "The happy path is simple: accept a payment, publish an event, process it. The harder question is what happens when only half of that sequence succeeds.",
  subhook:
    "I built this system to explore event-driven payment processing with Kafka, then started deliberately testing the assumptions underneath it: duplicate delivery, consumer crashes, offset handling, failed events, and the gap between PostgreSQL and Kafka.",

  originStory: [
    {
      text: "The original goal was straightforward: build an event-driven payment-processing backend that accepts a request over HTTP, hands the real work off asynchronously, and confirms the request without waiting for that work to finish. Separating synchronous ingestion from asynchronous processing with FastAPI and Kafka wasn't the hard part; wiring a producer and a consumer together is a well-worn pattern.",
    },
    {
      text: "Once the basic pipeline worked, I stopped adding features for a while and started asking a different question: where could the state of a payment become inconsistent? Not \"does it work\" but \"what happens when it doesn't\": a crash mid-consumer, a redelivered message, a gap between two systems that both think they're the source of truth.",
    },
    {
      text: "That question ended up being more interesting than the original feature list. The rest of this write-up follows that thread: what the system protects today, where it still doesn't, and why.",
    },
  ],

  prerequisiteNote:
    "HTTP APIs, relational databases, transactions, and basic asynchronous processing. Kafka-specific concepts (partitions, consumer groups, offsets, delivery semantics, idempotency, dead-letter queues) are explained where they affect this system.",

  invariants: {
    title: "What must remain true?",
    items: [
      { statement: "The same event ID must not change state twice.", status: "protected", statusLabel: "Protected" },
      { statement: "Kafka should not acknowledge unfinished work.", status: "protected", statusLabel: "Protected" },
      { statement: "Failed events should remain discoverable.", status: "protected", statusLabel: "Protected" },
      {
        statement: "A payment committed to PostgreSQL should eventually reach downstream processing.",
        status: "gap",
        statusLabel: "Known gap",
      },
    ],
  },

  architecture: {
    title: "What the first working version looked like",
    intro: "Trace a request step by step, or reset to see the whole picture.",
    diagram: {
      viewBox: "0 0 1100 660",
      nodes: [
        { id: "client", label: ["Client"], icon: "monitor", color: "zinc-300", x: 110, y: 330 },
        { id: "api", label: ["FastAPI", "/payments"], icon: "braces", color: "emerald-400", x: 380, y: 330 },
        { id: "postgres", label: ["PostgreSQL"], icon: "database", color: "violet-400", x: 630, y: 110 },
        { id: "dlq", label: ["DLQ:", "payment-events-dlq"], icon: "tray", color: "red-400", x: 960, y: 110 },
        { id: "kafka", label: ["Kafka:", "payment-events"], icon: "kafka", color: "orange-400", x: 630, y: 550 },
        { id: "consumer", label: ["Payment", "Consumer"], icon: "gear", color: "sky-400", x: 960, y: 550 },
      ],
      edges: [
        { id: "e1", from: "client", to: "api", label: ["POST", "/payments"] },
        { id: "e2", from: "api", to: "postgres", label: ["INSERT payment", "+ COMMIT"] },
        { id: "e3", from: "api", to: "kafka", label: ["produce event ·", "key=user_id"] },
        { id: "e4", from: "kafka", to: "consumer", label: ["deliver event"], parallelOffset: -20 },
        { id: "e5", from: "consumer", to: "kafka", label: ["commit offset", "after DB success"], parallelOffset: -20 },
        { id: "e6", from: "consumer", to: "postgres", label: ["transaction: idempotency", "check + state update"] },
        { id: "e7", from: "consumer", to: "dlq", label: ["publish failed event", "+ error context"], dashed: true },
      ],
      trace: [
        {
          caption: "The client sends a payment request.",
          nodeIds: ["client", "api"],
          edgeIds: ["e1"],
        },
        {
          caption:
            "FastAPI writes the payment to Postgres as \"pending\" and commits; this row now exists permanently, before anything else happens.",
          nodeIds: ["api", "postgres"],
          edgeIds: ["e2"],
        },
        {
          caption:
            "FastAPI separately produces the event to Kafka, keyed by user ID: a second, independent step, not part of the same transaction.",
          nodeIds: ["api", "kafka"],
          edgeIds: ["e3"],
        },
        {
          caption: "Sometime later, at its own pace, the consumer polls that event off Kafka.",
          nodeIds: ["kafka", "consumer"],
          edgeIds: ["e4"],
        },
        {
          caption:
            "Before touching any balance, the consumer runs one transaction: check the event ID hasn't been seen before, then update the balance and mark the payment processed.",
          nodeIds: ["consumer", "postgres"],
          edgeIds: ["e6"],
        },
        {
          caption:
            "Only after that transaction commits does the consumer tell Kafka it's done and commit the offset.",
          nodeIds: ["consumer", "kafka"],
          edgeIds: ["e5"],
        },
        {
          caption:
            "If processing had failed instead, the event would go to the dead-letter queue with its error context, not disappear silently.",
          nodeIds: ["consumer", "dlq"],
          edgeIds: ["e7"],
        },
      ],
    },
    pathSteps: [
      "The client sends POST /payments with a user ID and an amount.",
      "FastAPI validates the request, writes the payment row to Postgres as pending, and commits; that row now exists permanently, regardless of anything that happens next.",
      "Only after that commit does FastAPI separately produce an event to Kafka, then return a response to the client, without waiting for the payment to actually be processed.",
      "Sometime later, at its own pace, the consumer polls that event off Kafka.",
      "Before touching any balance, it tries to register the event's ID in a table that only accepts each ID once; if that fails, it already knows this is a redelivery and stops right there.",
      "Otherwise, it updates the balance and marks the payment processed, inside one database transaction.",
      "Only once that transaction commits does the consumer tell Kafka it's done with the message and commit the offset.",
      "If processing throws instead, the event goes to the dead-letter queue rather than crashing the consumer or disappearing silently.",
    ],
  },

  failureLab: {
    title: "Now break the system",
    intro:
      "The easiest way to understand the design is to break it at specific points and follow what happens next.",
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
            title: "Kafka may redeliver evt_482",
            plain:
              "Since no offset was ever committed for this message, the group has no record of it being handled, and it may be delivered again to whichever consumer picks it up next.",
          },
          {
            title: "The consumer tries to register the event ID again",
            plain:
              "Before touching any balance, the consumer runs the same insert into processed_events it always runs first.",
          },
          {
            title: "The state is not applied twice",
            plain:
              "The insert affects zero rows, since the event ID already exists, so the consumer recognizes this as a duplicate and stops before the balance is touched again.",
          },
        ],
        visual: {
          kind: "timeline",
          totalDuration: 8,
          unit: "s",
          segments: [
            {
              id: "delivered",
              label: "delivered",
              start: 0,
              duration: 0,
              color: "default",
              description: "First delivery. The consumer begins processing evt_482.",
            },
            {
              id: "dbwrite",
              label: "DB commit",
              start: 1,
              duration: 0,
              color: "default",
              description: "Balance updated, payment marked processed; the transaction commits.",
            },
            {
              id: "crash",
              label: "crash",
              start: 1.8,
              duration: 0,
              color: "fail",
              description:
                "The process dies before it ever tells Kafka \"I'm done with this one\"; the offset was never committed.",
            },
            {
              id: "redeliver",
              label: "redelivered",
              start: 5,
              duration: 0,
              color: "wait",
              description:
                "With no offset committed, the group has no record of evt_482 being handled, and it may be sent again.",
            },
            {
              id: "dedup",
              label: "rejected",
              start: 6,
              duration: 0,
              color: "success",
              description:
                "The processed_events insert affects zero rows, so the consumer stops before touching the balance again.",
            },
          ],
        },
        explanation: [
          {
            text: "The system does not depend on the event being delivered only once. It makes redelivery safe.",
          },
          {
            text: "Kafka durably retains events according to its replication, acknowledgment, and retention configuration, while consumers track progress using offsets. A crash before the offset commits can cause a redelivery, and the consumer is built to tolerate that rather than assume it won't happen, enforced by the event_id uniqueness check in Postgres.",
          },
        ],
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
            "The duplicate check is database-enforced in one atomic statement, not a separate check-then-insert sequence that could race.",
        },
      },
      {
        id: "processing-error",
        tabLabel: "Consumer throws an error",
        title: "Consumer processing fails",
        steps: [
          {
            title: "Consumer receives a payment event",
            plain: "A normal event arrives off the payment-events topic.",
          },
          {
            title: "Processing fails",
            plain:
              "An exception is raised partway through handling: malformed event data, a downstream error, anything that isn't the happy path.",
          },
          {
            title: "The database transaction rolls back where applicable",
            plain: "Any partial writes for this event are undone; nothing half-updates.",
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
        explanation: [
          {
            text: "A DLQ preserves and isolates failed events, but it is not a complete recovery workflow by itself.",
          },
          {
            text: "Investigation and safe reprocessing still require separate operational logic; right now, the DLQ consumer logs the failure but doesn't store it anywhere reviewable or retry it automatically.",
          },
        ],
      },
      {
        id: "dual-write",
        tabLabel: "API crashes between PostgreSQL and Kafka",
        title: "FastAPI commits the payment, but the Kafka publish never happens",
        steps: [
          {
            title: "Client submits a payment",
            plain: "POST /payments arrives and FastAPI opens a database connection.",
          },
          {
            title: "FastAPI commits the payment row to PostgreSQL",
            plain:
              "A pending row is written and the transaction commits; this payment now permanently exists in the system's records.",
          },
          {
            title: "The application crashes, or the Kafka publish fails",
            plain:
              "Say the broker is unreachable, or the producer's buffer is full; flush() has no timeout, so this can also hang indefinitely instead of failing fast.",
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
          left: { label: "PostgreSQL", state: "payment exists ✓" },
          right: { label: "Kafka", state: "event missing ✕" },
          takeaway: "The database knows about the payment. Kafka doesn't.",
        },
        explanation: [
          {
            text: "This is the dual-write problem: two independent systems, Postgres and Kafka, are both supposed to reflect the same event, but nothing ties their two writes into one atomic operation. Success in one does not guarantee success in the other. It's covered in full below, since it's the most significant open gap in the current design.",
          },
        ],
        gapLabel: "Known gap in current implementation",
      },
    ],
  },

  reliability: {
    title: "Reliability, mechanism by mechanism",
    intro: "Three small design choices do most of the work described above.",
    subsections: [
      {
        heading: "Making redelivery safe",
        paragraphs: [
          {
            text: "The consumer needs to recognize \"I've already handled this event\" before it touches any balance, and that recognition has to be atomic, or it doesn't actually protect anything.",
          },
        ],
        codeBad: {
          label: "A pattern that can race",
          lang: "python",
          code: `if event_id not in processed_events:
    insert(event_id)`,
        },
        codeGood: {
          label: "What's actually running",
          lang: "sql",
          code: `INSERT INTO processed_events (event_id)
VALUES (...)
ON CONFLICT (event_id) DO NOTHING;`,
        },
      },
      {
        heading: "Deciding when work is actually complete",
        paragraphs: [
          {
            text: "Kafka's default behavior is to advance a consumer's offset on a timer, regardless of whether your code actually finished with that message. This project turns that off and commits the offset by hand, only once the database work has committed.",
          },
          {
            label: "Why it matters",
            text: "If the consumer group advances past an event before the application-side work finishes, a crash can leave the group with no normal reason to redeliver that event, since Kafka has no way to know the work never actually happened. Manual commits keep \"Kafka thinks this is done\" aligned with \"the database agrees it's done.\"",
          },
        ],
        comparisonDiagram:
          "AUTO-COMMIT\n\noffset may advance\nbefore application work is complete\n\n\nMANUAL COMMIT\n\ndatabase work succeeds\n        ↓\noffset committed",
      },
      {
        heading: "Isolating failed events",
        paragraphs: [
          {
            text: "When processing throws partway through, the event is moved to a dedicated dead-letter topic instead of crashing the consumer or retrying forever inline.",
          },
          {
            text: "Those are still manual today; the DLQ consumer currently just logs what arrives.",
          },
        ],
        solves: ["visibility", "isolation", "continued processing of everything behind it"],
        doesNotSolve: ["root-cause analysis", "repair", "safe replay", "a reprocessing strategy"],
      },
    ],
  },

  consumerScaling: {
    title: "How much parallelism do four partitions actually give me?",
    intro:
      "The Failure Lab above is about correctness under crashes; this is about throughput under load, and it runs into a different kind of limit.",
    assignmentNote:
      "This is a conceptual assignment visualization: the exact algorithm Kafka uses to assign partitions may differ, but one partition is owned by at most one consumer within a consumer group at a time.",
    partitionCount: 4,
    consumerOptions: [1, 3, 4, 6],
    measured: [
      { consumers: 1, seconds: 16.11 },
      { consumers: 3, seconds: 8.03 },
      { consumers: 4, seconds: 6.73 },
    ],
    measuredLabel: "1,000 simulated events, 4-partition topic",
    disclaimer: "This is a learning benchmark, not a production throughput claim.",
    takeaway:
      "Within one consumer group, useful parallelism is bounded by partition count; a 5th or 6th consumer in the same group just sits idle.",
  },

  dualWrite: {
    title: "The failure my current design does not solve",
    subheading: "PostgreSQL succeeds. Kafka doesn't.",
    currentDiagram: "FastAPI\n  ├── PostgreSQL commit ✓\n  └── Kafka publish ✕",
    paragraphs: [
      {
        text: "Postgres and Kafka are two separate systems with no shared transaction between them. FastAPI commits the payment row first, then, as a second and independent step, tries to publish the corresponding event to Kafka.",
      },
      {
        text: "A normal Postgres transaction can't atomically include a Kafka publish; there's no two-phase commit tying the two together. So the success of the first operation says nothing about whether the second will succeed.",
      },
      {
        text: "If the broker is unreachable, or the producer's buffer is full, that publish can fail outright, or hang, since the flush call here has no timeout. Either way, Postgres now has a payment that Kafka has never heard of, and no consumer will ever see it.",
      },
      {
        text: "The obvious-looking fix, retrying the publish, doesn't fully solve it either. A retry after an ambiguous failure (a timeout, a connection reset) can't always tell whether the first attempt actually landed, so blind retries can create a second, duplicate event for the same payment.",
      },
      {
        text: "That's exactly why consumer-side idempotency, covered above, still matters even if the producer side gets more reliable: at-least-once delivery is what a producer retry buys you, and duplicates are the cost of that guarantee.",
      },
    ],
    nextHeading: "One possible next step: transactional outbox",
    nextStatusLabel: "Not yet implemented",
    nextDiagram:
      "ONE PostgreSQL transaction\n├── payment row\n└── outbox event row\n\noutbox publisher\n       ↓\n     Kafka",
    nextParagraphs: [
      {
        text: "Writing the payment row and an \"outbox\" event row in the same Postgres transaction means either both exist or neither does, with no window where one system knows about a payment the other doesn't. A separate publisher process then relays outbox rows to Kafka at its own pace.",
      },
      {
        label: "Tradeoff",
        text: "This closes the gap described above, but adds a new moving part, the publisher, with its own failure mode: it can crash after sending to Kafka but before marking a row relayed, producing a duplicate publish. Consumers still need idempotency either way.",
      },
      {
        text: "A simpler, complementary option is reconciliation: identify payments that remain pending beyond an expected processing window, and reconcile them against downstream processing records; no new write path, just a periodic check over the existing one.",
      },
    ],
    lesson:
      "Reliability patterns do not eliminate failure. They move the failure boundary to somewhere easier to recover from.",
  },

  decisions: {
    title: "A few more decisions worth explaining",
    items: [
      {
        heading: "Why manual offset commits?",
        paragraphs: [
          {
            text: "I wanted the offset commit to mean something specific: that the database work for this message actually finished, not that a timer elapsed.",
          },
          {
            label: "Alternative considered",
            text: "Leave Kafka's default auto-commit on, which advances the offset on a timer independent of whether the application finished processing.",
          },
          {
            label: "Tradeoff",
            text: "Manual offset control increases implementation responsibility (every code path, including failures routed to the DLQ, has to explicitly decide when it's safe to commit), but it lets processing completion align more closely with persisted application state instead of a timer.",
          },
        ],
      },
      {
        heading: "Why database-enforced event idempotency, not an in-memory check?",
        paragraphs: [
          {
            text: "I wanted the \"have I processed this event?\" decision to be atomic. A database uniqueness constraint avoids a separate check-then-insert race and makes duplicate detection part of the transaction boundary.",
          },
          {
            label: "Alternative considered",
            text: "Track \"already processed\" IDs in an in-memory set or cache instead of a database constraint.",
          },
          {
            label: "Tradeoff",
            text: "An in-memory check is faster, but forgets everything on restart and doesn't hold up once there's more than one consumer process; the database constraint survives both, at the cost of one extra write per event.",
          },
        ],
      },
      {
        heading: "Why key events by user_id?",
        paragraphs: [
          {
            text: "Kafka events for this project are produced with the user ID as the partition key, so every event for a given user lands in the same partition and is processed in the order it was produced.",
          },
          {
            label: "Alternative considered",
            text: "Random or unkeyed distribution, letting the producer spread events across partitions however it likes.",
          },
          {
            label: "Tradeoff",
            text: "Preserving per-user ordering constrains where those events can be processed: every event for one user is bound to a single partition, and therefore to whichever single consumer owns it, rather than being freely spreadable across the whole group. It can also create uneven partition load if some users generate substantially more traffic than others, since their events all queue behind the same partition regardless of how idle the rest of the topic is.",
          },
        ],
      },
      {
        heading: "Why a DLQ that isolates failures but doesn't yet close the loop on them?",
        paragraphs: [
          {
            text: "I wanted a failed event to stay visible and out of the way of everything behind it, without having to solve reprocessing on day one.",
          },
          {
            label: "Alternative considered",
            text: "Build the full second half too: give the DLQ topic explicit partitions, and have its consumer store failed events somewhere reviewable and reprocessable.",
          },
          {
            label: "Tradeoff",
            text: "Shipping \"quarantine failures separately\" first protects the main stream immediately. It also creates an operational responsibility this project hasn't built yet: investigating and eventually reprocessing or resolving those events safely.",
          },
        ],
      },
    ],
  },

  codeProof: {
    title: "Code that proves the claim",
    items: [
      {
        title: "The idempotent insert",
        lang: "sql",
        code: `INSERT INTO processed_events (event_id)
VALUES (%s)
ON CONFLICT (event_id) DO NOTHING;`,
        explanation:
          "The duplicate check is database-enforced in one atomic statement, not a separate check-then-insert sequence that could race.",
      },
      {
        title: "Where the DB commit and Kafka publish diverge",
        lang: "python",
        code: `conn.commit()          # payment row now permanently exists
produce_event(event)   # separate step, can still fail on its own`,
        explanation:
          "These operations succeed or fail independently; see \"The failure my current design does not solve\" above for what that means when the second one doesn't.",
      },
    ],
  },

  futureWork: {
    title: "Open problems I want to test next",
    items: [
      {
        heading: "PostgreSQL → Kafka consistency",
        text: "Explore the transactional outbox pattern above, or a reconciliation job, to close the gap described in that section.",
      },
      {
        heading: "DLQ recovery",
        text: "Build safe replay tooling; right now a failed event can be seen, but not reprocessed, without manual intervention.",
      },
      {
        heading: "Retry strategy",
        text: "Add backoff and retry classification before an event is routed to the DLQ at all, instead of failing straight to it on the first error.",
      },
      {
        heading: "Observability",
        text: "Track processing latency, consumer lag, failure counts, and DLQ volume; right now the only visibility into consumer health is log lines.",
      },
      {
        heading: "External processor simulation",
        text: "Simulate a real payment processor's failure modes (timeouts, ambiguous outcomes, retries) and test reconciliation against them.",
      },
    ],
  },

  conclusion: {
    title: "What this project taught me",
    paragraphs: [
      {
        text: "Kafka doesn't remove application-level correctness problems; it relocates them. At-least-once delivery means duplicates are a normal, expected outcome, not an edge case, and that pushes the responsibility for correctness into how the consumer is written, not into the broker's guarantees.",
      },
      {
        text: "Database constraints turned out to be one of the more useful tools here, not just for data integrity but as a concurrency primitive: a unique constraint with ON CONFLICT DO NOTHING answers \"have I seen this before?\" atomically, in a way an in-memory check can't.",
      },
      {
        text: "\"Processing succeeded\" only means something once you've defined which state transitions actually need to be durable; the offset commit exists specifically to encode that definition in a way Kafka can act on.",
      },
      {
        text: "And the hardest failures in this project weren't inside any single component; Postgres and the consumer are both individually reliable. They showed up at the seam between two systems that don't share a transaction, which is exactly where the dual-write gap above still lives.",
      },
    ],
  },

  glossary: [
    {
      term: "Partition",
      definition:
        "A Kafka topic is split into an ordered, independent log per partition; order is preserved within one partition, not guaranteed across partitions.",
    },
    {
      term: "Consumer group",
      definition:
        "A named set of consumers sharing the work of reading a topic: Kafka guarantees each partition is owned by exactly one consumer in the group at a time.",
    },
    {
      term: "Offset",
      definition:
        "Kafka's bookmark of how far a consumer has read in a partition: committing an offset means telling Kafka \"I've handled everything up to here.\"",
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
        "The risk of writing related data to two independent systems with no shared transaction: one write can succeed while the other fails, leaving them out of sync.",
    },
    {
      term: "Transactional outbox",
      definition:
        "A pattern where the event to publish is written in the same database transaction as the primary write, then relayed to the broker by a separate process, so the two writes can't diverge.",
    },
  ],
};
