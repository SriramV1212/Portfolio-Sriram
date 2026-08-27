import type { GrpcCaseStudyContent } from "./types";

// microservices-resilience-engine — a small 3-service gRPC system (a tiny
// flight-booking flow) built specifically to explore what happens when one
// downstream dependency starts failing: retries, a circuit breaker, mTLS
// between services, and the observability stack needed to actually watch
// any of that happen instead of guessing from a stack trace.
export const grpcCaseStudy: GrpcCaseStudyContent = {
  hook:
    "A successful request is easy to reason about. The interesting part starts when one downstream service becomes slow, flaky, or unavailable.",
  subhook:
    "This project is a small three-service gRPC system built specifically to sit inside that second sentence — not to book real flights, but to make retries, a circuit breaker, and secured service-to-service calls into something you can actually watch happen, not just something the code claims to do.",

  intro: [
    {
      text: "Three services model a tiny flight-booking flow, talking to each other over gRPC and protobuf. An Orchestrator receives a booking request and coordinates two others: a User service that checks whether the caller is allowed to book, and a Search service that returns flight options.",
    },
    {
      text: "The booking logic itself was never the point. It exists to give three real services a real reason to call each other constantly, so that everything wrapped around those calls — retry with backoff, a circuit breaker, mutual TLS on the inter-service hops, and OpenTelemetry/Prometheus/Grafana/Jaeger observability — has something genuine to protect and something genuine to show.",
    },
    {
      text: "Once the three services existed and could talk to each other, the interesting engineering question stopped being \"does this work\" and became: what does the system actually do when Search — the one dependency it's realistic to make flaky on purpose — starts failing? Answering that honestly meant building a way to watch it happen, not just handling the exception and moving on.",
    },
  ],

  assumedKnowledge:
    "Assumed knowledge: basic client-server networking, APIs, and synchronous request/response communication. gRPC, retries, circuit breakers, mTLS, and observability concepts are explained where they matter to this system.",

  invariants: {
    title: "What must remain true?",
    items: [
      {
        statement:
          "A client request should fail fast once a dependency is confirmed unhealthy, rather than hang indefinitely.",
        status: "gap",
        statusLabel: "Partial",
      },
      {
        statement:
          "One unhealthy dependency should not keep consuming caller resources with unbounded retries.",
        status: "protected",
        statusLabel: "Bounded",
      },
      {
        statement:
          "Backend-to-backend hops (Orchestrator→User, Orchestrator→Search) are mutually authenticated and encrypted.",
        status: "protected",
        statusLabel: "Protected",
      },
      {
        statement:
          "The client-facing Orchestrator edge (Client→Orchestrator) is encrypted and authenticated.",
        status: "gap",
        statusLabel: "Known gap",
      },
      {
        statement:
          "Latency and failures should be traceable across every service boundary a request crosses.",
        status: "protected",
        statusLabel: "Instrumented",
      },
      {
        statement:
          "Where the implementation falls short of these, that gap should be visible in the system's own design — not smoothed over.",
        status: "protected",
        statusLabel: "By design",
      },
    ],
  },

  architecture: {
    title: "What the first working version looked like",
    intro:
      "The request path is short — one client-facing hop and two inter-service hops — but each of the three edges behaves differently, and that difference is most of what this project is actually about.",
    figure: {
      src: "/case-studies/grpc/grpc_request_flow_architecture.png",
      alt: "Diagram of the gRPC request flow: a Client calling the Orchestrator Service over insecure gRPC, the Orchestrator calling the User Service and Search Service over secure mTLS, with a Resilience Logic box showing retry with exponential backoff and a circuit breaker scoped to Search calls only.",
      width: 2000,
      height: 1134,
      caption:
        "The request path as built: one unencrypted client-facing edge, two mTLS-protected inter-service hops, and resilience logic scoped to the Search call only.",
    },
    steps: [
      {
        title: "Client calls Orchestrator",
        plain:
          "BookFlight (or StreamFlightPrices) arrives on the Orchestrator's insecure inbound port on 50053 — nothing about this hop is encrypted or authenticated.",
      },
      {
        title: "Orchestrator begins a root trace span",
        plain:
          "A span opens for this request before any downstream call is made, so the entire journey — retries included — ends up on one connected trace instead of several disconnected ones.",
      },
      {
        title: "Orchestrator calls the User service",
        plain:
          "ValidateUser goes out over mTLS on port 50051. This call goes through retry logic, but not the circuit breaker — a rejected user isn't the failure mode this project is built to protect against.",
      },
      {
        title: "An invalid user stops everything right here",
        plain:
          "If User says no, the Orchestrator returns failure immediately — Search is never contacted for that request.",
      },
      {
        title: "Orchestrator calls the Search service",
        plain:
          "SearchFlights (or the streaming variant) goes out over mTLS on port 50052, wrapped in both retry-with-backoff and the circuit breaker — the only call in this system that gets both layers.",
      },
      {
        title: "Retry and the circuit breaker may intervene",
        plain:
          "If Search fails, retry waits and tries again, up to 3 attempts, rechecking the breaker's current state fresh on every single attempt. Enough consecutive failures trip the breaker open for the next 10 seconds.",
      },
      {
        title: "Orchestrator assembles the final response",
        plain:
          "Once both calls resolve — or Search's attempts are exhausted — results get formatted into a single BookFlight response and returned to the client.",
      },
      {
        title: "Telemetry is emitted throughout",
        plain:
          "Each downstream call gets its own child span, and each service increments its own request/error counters as it goes — none of this waits until the request finishes to be recorded.",
      },
    ],
  },

  breakSystem: {
    title: "Now break the system",
    intro:
      "Search has a commented-out block that, when manually enabled, makes it fail randomly about half the time — built specifically so the circuit breaker's behavior could be watched directly instead of inferred from reading the code.",
    steps: [
      {
        title: "The failure switch gets flipped on",
        plain:
          "A block at the top of Search's method gets manually uncommented: on every call, there's now roughly a 50% chance it throws an exception. There's no environment variable for this — it's a code comment toggled by hand.",
      },
      {
        title: "A request hits bad luck on its first attempt",
        plain:
          "A booking request comes in, the user check passes fine, and the call to Search fails on the coin flip. Retry catches this, waits 1 second, and tries again.",
      },
      {
        title: "It fails again — the wait doubles to 2 seconds",
        plain:
          "Second attempt also loses the coin flip. The backoff logic doubles the wait before the next, final attempt — this is the \"exponential\" in exponential backoff.",
      },
      {
        title: "The third attempt fails too — and trips the breaker",
        plain:
          "Because every retry attempt rechecks the circuit breaker fresh, this single request's own 3 failures push the failure count to its threshold. Right as this request gives up, the breaker flips to OPEN for the next 10 seconds.",
      },
      {
        title: "The very next request never reaches the network at all",
        plain:
          "A new booking request arrives moments later. The breaker sees it's OPEN and immediately rejects it — \"Circuit is OPEN. Skipping call\" — no network call happens.",
      },
      {
        title: "But it still waits — a real, slightly wasteful nuance",
        plain:
          "This new request still burns through all 3 retry attempts and their waits, even though every one is destined to fail instantly. The client experiences roughly 3 seconds of waiting for a request that never once touched Search.",
      },
      {
        title: "Ten seconds later, one request tests the waters",
        plain:
          "Once the cooldown passes, the next call is let through as a single HALF_OPEN probe. Success fully resets the breaker; another failure reopens it immediately without incrementing the failure count again.",
      },
      {
        title: "What this would look like in Jaeger and Grafana",
        plain:
          "A cluster of failed BookFlight traces around the moment the breaker trips, then a run of unusually fast failures with no backend latency in them — a direct, logical consequence of the breaker rejecting calls before they ever reach Search, and exactly the kind of pattern this observability setup is built to surface.",
      },
    ],
  },

  observability: {
    title: "How I made the system observable",
    figure: {
      src: "/case-studies/grpc/grpc_observability_flow_diagram.png",
      alt: "Diagram of the gRPC observability flow: User, Search, and Orchestrator services each exposing a /metrics endpoint scraped by Prometheus, which feeds Grafana dashboards, while OpenTelemetry trace data flows separately and directly from each service to Jaeger.",
      width: 2000,
      height: 1113,
      caption:
        "Two separate paths out of every service: metrics flow into Prometheus (then Grafana); traces flow, independently, straight to Jaeger.",
    },
    paragraphs: [
      {
        text: "Each of the three services exposes its own /metrics endpoint — User on :8000, Search on :8001, Orchestrator on :8002 — which Prometheus scrapes on an interval. Grafana never talks to a service directly; it builds its dashboards entirely from what's already sitting in Prometheus.",
      },
      {
        text: "Traces take a completely separate path. Each service's OpenTelemetry instrumentation exports span data over OTLP directly to Jaeger — that data never passes through Prometheus or Grafana at all.",
      },
      {
        label: "Why both",
        text: "Metrics and traces answer different questions. A Grafana dashboard tells you that something changed — an error rate or a latency percentile moved. A Jaeger trace tells you which specific hop, on which specific request, actually slowed down or failed, and in what order.",
      },
      {
        text: "This setup makes those changes observable: Grafana can surface changes in latency, error rate, and throughput, while Jaeger can show where an individual request spent time and whether downstream calls were executed at all — the difference between a request that failed after actually reaching Search and one the breaker rejected before it ever left the Orchestrator.",
      },
      {
        text: "When Search is failing, these tools make it easier to correlate service-level symptoms with the path taken by a specific request, instead of reasoning about the failure from logs alone.",
      },
      {
        text: "One honest asymmetry: the observability stack (Prometheus, Grafana, Jaeger) runs through Docker Compose, but the three gRPC services themselves currently run as local Python processes, not containers.",
      },
    ],
  },

  reliability: {
    title: "How the resilience logic actually behaves",
    intro:
      "Each mechanism is simple in isolation. What's less obvious is how they behave once they're stacked on top of each other on the same call.",
    topics: [
      {
        heading: "Retries, with exponential backoff",
        paragraphs: [
          {
            text: "The call to Search gets up to 3 attempts. Between attempts, the wait doubles instead of staying fixed — 1 second, then 2 — so a struggling service isn't hit with the exact same request rate it was already failing under.",
          },
          {
            text: "User validation also retries, but with no circuit breaker behind it — a rejected or slow user check isn't the failure mode this project set out to protect against.",
          },
        ],
      },
      {
        heading: "The circuit breaker's state machine",
        paragraphs: [
          {
            text: "Three states: CLOSED (normal), OPEN (reject instantly, no network call), and HALF_OPEN (let exactly one probe through after cooldown). 3 consecutive failures trip it open; the cooldown is 10 seconds.",
          },
          {
            text: "One detail that isn't obvious from the state diagram alone: because retry rechecks the breaker fresh on every attempt rather than once up front, the breaker's state can change mid-retry — a request can genuinely be the one whose own third attempt is what trips it.",
          },
        ],
      },
      {
        heading: "Why Search is the protected dependency",
        paragraphs: [
          {
            text: "Search is the one call deliberately built with a failure switch, and it's the dependency that sits on both the normal lookup path (SearchFlights, which returns a fixed flight list) and the streaming path (StreamFlightPrices, which produces changing prices over the stream) — a more realistic dependency to stress than a single boolean check, even though neither call is backed by a real search engine or datastore.",
          },
        ],
      },
      {
        heading: "Why these mechanisms have to be understood together",
        paragraphs: [
          {
            text: "Retry wrapping the breaker, instead of the reverse, has a real consequence once the breaker is open: a request still runs its full 3 attempts and their waits before learning each one failed instantly, costing roughly 3 seconds for a request that never reached the network. Reading the retry logic or the breaker logic alone wouldn't predict that — it only shows up once you trace one request through both.",
          },
        ],
      },
      {
        heading: "Why observability isn't optional here",
        paragraphs: [
          {
            text: "Without traces and metrics, a tripped breaker is invisible from the outside — it just looks like some requests got faster (rejected instantly) and others got slower (retried), with no explanation connecting the two. Observability is what turns \"requests started failing\" into \"the breaker opened because of 3 consecutive Search failures, and here's the exact trace where that happened.\"",
          },
        ],
      },
    ],
  },

  decisions: {
    title: "A few more decisions worth explaining",
    items: [
      {
        heading: "gRPC and protobuf over REST for inter-service calls",
        paragraphs: [
          {
            text: "These calls happen constantly and automatically between backend services, not once per user click, so an explicit typed contract mattered more than the convenience of a plain JSON endpoint. Service methods and message shapes are defined once in .proto files and generated into typed client/server code for all three services.",
          },
          {
            label: "Alternative considered",
            text: "Use REST/JSON between services, since it's the more common default for web APIs.",
          },
          {
            label: "Tradeoff",
            text: "The shared protobuf schema and generated stubs reduce contract drift and make incompatible message shapes explicit earlier, and HTTP/2 gives the streaming call somewhere Python doesn't have to build itself — at the cost of codegen tooling and losing the \"just open it in a browser or curl it\" debuggability plain JSON has.",
          },
        ],
      },
      {
        heading: "Why hand-roll the circuit breaker?",
        paragraphs: [
          {
            text: "I implemented the breaker directly, in plain Python, because I wanted to understand the state transitions myself and see exactly how it interacts with retries, rather than hide that behavior behind a library. It's scoped to the Search call only — not User validation, not the streaming price feed — since Search is the dependency deliberately made flaky for testing (the exact thresholds and states are covered above).",
          },
          {
            label: "Alternative considered",
            text: "Use an existing circuit-breaker library, and/or apply it uniformly to every outbound call.",
          },
          {
            label: "Tradeoff",
            text: "A custom implementation is easier to inspect but lacks the maturity, edge-case coverage, and configurability of a production resilience library.",
          },
        ],
      },
      {
        heading: "Why retry wraps the circuit breaker, not the other way around",
        paragraphs: [
          {
            text: "I structured the retry loop to call through the circuit breaker fresh on every attempt, rather than check it once up front, because I wanted a request's own retries to be able to trip the breaker mid-sequence — a scenario the walkthrough above shows directly.",
          },
          {
            label: "Alternative considered",
            text: "Check the circuit breaker once up front, and only enter the retry loop at all if it's currently closed.",
          },
          {
            label: "Tradeoff",
            text: "Checking once up front would fail faster once the breaker is already known to be open, at the cost of a request no longer being able to be the one whose own retries trip it.",
          },
        ],
      },
      {
        heading: "Why mTLS only on the two hops the Orchestrator initiates",
        paragraphs: [
          {
            text: "I scoped mTLS to the two hops the Orchestrator itself initiates (User, Search) because backend-to-backend trust was specifically what this project set out to explore — the invariants above call out the client-facing edge as the known gap rather than smoothing over it.",
          },
          {
            label: "Alternative considered",
            text: "Also put the Orchestrator's own inbound port behind mTLS, or at minimum plain TLS.",
          },
          {
            label: "Tradeoff",
            text: "In a real deployment, the client-facing edge would typically sit behind its own protection — a load balancer or API gateway — which this project doesn't include; securing every hop would close this gap entirely, it just wasn't what got built here.",
          },
        ],
      },
      {
        heading: "User validation is a stub, on purpose",
        paragraphs: [
          {
            text: "\"Is this user allowed to book\" is answered by a single string comparison against one hardcoded user_id — no database, no real user store, no actual authentication behind it.",
          },
          {
            label: "Alternative considered",
            text: "Wire up a real user lookup, even a minimal one.",
          },
          {
            label: "Tradeoff",
            text: "Keeping User validation trivial kept the project's actual focus — circuit breakers, retries, mTLS, tracing, metrics — from getting diluted by an unrelated auth system, at the cost of a demo that's less realistic on that one dimension.",
          },
        ],
      },
      {
        heading: "Docker Compose for the observability stack, not the services",
        paragraphs: [
          {
            text: "Prometheus, Grafana, and Jaeger run under one docker compose up. The three gRPC services run as local Python processes.",
          },
          {
            label: "Alternative considered",
            text: "Containerize everything, services included.",
          },
          {
            label: "Tradeoff",
            text: "The observability stack is static infrastructure that doesn't change while developing — Compose removes real setup friction there for free. Leaving the services as local processes keeps the edit-and-restart loop fast during active development, at the cost of not yet proving the whole system also behaves correctly containerized — that's listed as future work below.",
          },
        ],
      },
    ],
  },

  codeProof: {
    title: "Code that proves the claim",
    items: [
      {
        title: "The circuit breaker's core check",
        lang: "python",
        code: `if self.state == "OPEN":
    if time.time() - self.last_failure_time > self.recovery_time:
        self.state = "HALF_OPEN"
    else:
        raise Exception("Circuit is OPEN. Skipping call.")`,
        explanation:
          "The heart of the state machine — once open, every call is rejected instantly until the cooldown passes, at which point exactly one call gets through to test the waters.",
      },
      {
        title: "What's actually a stub vs. what's real",
        lang: "python",
        code: `# orchestrator_server.py — the orchestrator's own inbound port has no TLS:
server.add_insecure_port('[::]:50053')

# user_server.py — "validation" is a single hardcoded comparison:
if user_id == "123":`,
        explanation:
          "Two honest limitations worth seeing in the actual code — the Orchestrator secures its outbound calls but not its own inbound port, and \"user validation\" is a placeholder, not real logic.",
      },
    ],
  },

  futureWork: {
    title: "Open problems I want to test next",
    items: [
      "Secure the Orchestrator's own client-facing edge with TLS, not just its outbound calls to User and Search.",
      "Build a proper failure-injection mechanism — a config flag or admin endpoint — instead of a code comment that has to be toggled by hand.",
      "Add request deadlines and timeouts, so a slow (not just a failing) dependency is bounded too.",
      "Containerize the three gRPC services themselves, so the whole system — not just the observability stack — runs the same way in every environment.",
      "Extend the circuit breaker and retry policy to the User-service call path, not only Search.",
      "Add real health checks and readiness probes, and centralized configuration instead of values hardcoded per service.",
    ],
  },

  conclusion: {
    title: "What this project taught me",
    paragraphs: [
      {
        text: "Retries are not automatically safe. Without a bound and a growing backoff, retrying a struggling dependency just adds load to something that's already failing — the cap at 3 attempts and the doubling wait weren't incidental details, they were the difference between protecting Search and making its problem worse.",
      },
      {
        text: "A circuit breaker protects the caller as much as the dependency. The clearest example here is the request that arrives right after the breaker trips: it fails in about the same time as a request that goes all the way to Search, because it still runs its retry waits — the breaker skipped the network call, but the caller still paid for the decision to check three times.",
      },
      {
        text: "Resilience mechanisms interact in ways that aren't visible from reading either one in isolation. Retry wrapping the breaker instead of the other way around is a one-line structural choice, but it changes who can trip the breaker and what a caller experiences once it's open — that only became obvious by tracing one request through both mechanisms together, not by reading the retry loop or the breaker separately.",
      },
      {
        text: "\"We use mTLS between services\" is a claim that only means something once every hop has actually been checked — this project's two inter-service edges are genuinely protected, and its client-facing edge genuinely isn't, and saying both of those things plainly is more useful than a diagram that implies uniform coverage. Breaking the system on purpose, and watching what Jaeger and Grafana actually showed while it happened, taught me more about this system's real behavior than any amount of testing only the happy path did.",
      },
    ],
  },

  glossary: [
    {
      term: "gRPC",
      definition:
        "A framework for one program to call another program's functions directly across a network, defined by a shared contract — closer to calling a function than hitting a web API.",
    },
    {
      term: "Protobuf",
      definition:
        "The typed contract language gRPC is built on — service methods and message shapes are defined once, then generated into client/server code.",
    },
    {
      term: "Retry",
      definition:
        "Trying a failed call again instead of giving up immediately, usually a bounded number of times.",
    },
    {
      term: "Exponential backoff",
      definition:
        "Waiting progressively longer between retry attempts instead of retrying instantly and repeatedly.",
    },
    {
      term: "Circuit breaker",
      definition:
        "A safety switch: after enough consecutive failures, stop even trying to call a struggling dependency for a cooldown period, instead of hammering something that's already down.",
    },
    {
      term: "Half-open",
      definition:
        "The circuit breaker's third state — after the cooldown, exactly one call is let through as a test; success resets the breaker, failure reopens it.",
    },
    {
      term: "mTLS (mutual TLS)",
      definition:
        "A secured connection where both sides prove their identity with a certificate, not just the server the way a normal HTTPS website does.",
    },
    {
      term: "Trace",
      definition:
        "A record of one request's full journey across every service it touched, assembled from the spans it generated along the way.",
    },
    {
      term: "Span",
      definition:
        "One timed, named unit of work inside a trace — a single service call, for example — that can have its own child spans nested inside it.",
    },
    {
      term: "Prometheus",
      definition:
        "The metrics system used here — it scrapes each service's /metrics endpoint on an interval and stores the results as time series.",
    },
    {
      term: "Grafana",
      definition:
        "The dashboard tool used here — it queries Prometheus and renders the metrics as graphs; it never talks to a service directly.",
    },
    {
      term: "Jaeger",
      definition:
        "The tracing backend used here — services export trace/span data to it directly, so a full request trace can be viewed and searched after the fact.",
    },
  ],
};
