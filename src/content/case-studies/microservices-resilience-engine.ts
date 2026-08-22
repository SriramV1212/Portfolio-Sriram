import type { CaseStudy } from "./types";

export const microservicesResilienceEngine: CaseStudy = {
  hook:
    "Real service meshes don't fail cleanly — one struggling service can quietly drag down everything that calls it, and \"is this connection actually trustworthy\" is a question every hop has to answer for itself. This project builds a small 3-service system specifically to explore those two problems hands-on: what a circuit breaker actually looks like mid-trip, and what \"secure\" really covers once you trace every hop honestly instead of just the ones that were easy to lock down.",

  foundations: [
    {
      term: "Network request",
      plain:
        "A network request is one program asking another program — possibly on a completely different machine — to do something or return information, then waiting for a response. Every call in this project goes over the network like this, even between services sitting in the same repo.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "a", label: "Your program", col: 0 },
          { id: "b", label: "Another program", col: 1 },
        ],
        edges: [
          { from: "a", to: "b", direction: "both", label: "asks for something", labelReverse: "sends back a result" },
        ],
      },
    },
    {
      term: "Service-to-service vs. browser-to-server",
      plain:
        "A browser calling a web server usually answers one page view, started by a person clicking something. Two backend services calling each other happens constantly and automatically — this project's Orchestrator calls User and Search dozens of times a second, not once per click.",
      visual: {
        kind: "side-by-side",
        leftLabel: "Browser → server",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "br", label: "Browser", col: 0 },
            { id: "ws", label: "Web server", col: 1 },
          ],
          edges: [{ from: "br", to: "ws", label: "loads a page, once per click" }],
        },
        rightLabel: "Service → service",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "or", label: "Orchestrator", col: 0 },
            { id: "us", label: "User service", col: 1 },
          ],
          edges: [{ from: "or", to: "us", label: "calls directly, many times/sec" }],
        },
      },
    },
    {
      term: "gRPC vs. REST",
      plain:
        "REST, the common web-API style, sends plain JSON text over HTTP to URL-style paths. gRPC defines an exact contract up front — function names, their inputs and outputs — so a call looks almost like calling a regular function, just across the network.",
      visual: {
        kind: "side-by-side",
        leftLabel: "REST",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "c1", label: "Client", col: 0 },
            { id: "s1", label: "Server", col: 1 },
          ],
          edges: [{ from: "c1", to: "s1", label: "GET /users/123 → JSON" }],
        },
        rightLabel: "gRPC",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "c2", label: "Client", col: 0 },
            { id: "s2", label: "Server", col: 1 },
          ],
          edges: [{ from: "c2", to: "s2", label: "GetUser(123) → typed response" }],
        },
      },
    },
    {
      term: "Retry / exponential backoff",
      plain:
        "Retrying means trying a failed call again instead of giving up immediately. Exponential backoff means waiting progressively longer between attempts, instead of retrying instantly and pounding a struggling service even harder.",
      visual: {
        kind: "timeline",
        totalDuration: 4,
        unit: "s",
        segments: [
          { id: "a1", label: "attempt 1 (fails)", start: 0, duration: 0, color: "fail", description: "The first call to Search throws an error." },
          { id: "w1", label: "wait 1s", start: 0, duration: 1, color: "wait", description: "Instead of retrying instantly, the code pauses — this is the \"backoff.\"" },
          { id: "a2", label: "attempt 2 (fails)", start: 1, duration: 0, color: "fail", description: "Second attempt also fails." },
          { id: "w2", label: "wait 2s", start: 1, duration: 2, color: "wait", description: "The wait doubles — this is the \"exponential\" part." },
          { id: "a3", label: "attempt 3 (final)", start: 3, duration: 0, color: "fail", description: "Last allowed attempt — if this fails too, the caller gives up and reports failure." },
        ],
      },
    },
    {
      term: "Circuit breaker",
      plain:
        "A circuit breaker is a safety switch: after enough failures in a row, it stops even trying to call a struggling service for a cooldown period, instead of hammering something that's already down. Click through its 3 states below.",
      visual: {
        kind: "state-machine",
        viewBox: "0 0 340 200",
        initialId: "closed",
        states: [
          { id: "closed", label: "CLOSED", description: "Normal operation — every call goes straight through to the real service.", x: 70, y: 100 },
          { id: "open", label: "OPEN", description: "Too many failures in a row. Every call is rejected instantly, without ever touching the network, until the cooldown passes.", x: 260, y: 50 },
          { id: "half-open", label: "HALF-OPEN", description: "Cooldown's over. Exactly one call is let through as a test — succeed and it fully resets, fail and it reopens.", x: 260, y: 150 },
        ],
        transitions: [
          { from: "closed", to: "open", label: "too many failures" },
          { from: "open", to: "half-open", label: "cooldown ends" },
          { from: "half-open", to: "closed", label: "test succeeds" },
          { from: "half-open", to: "open", label: "test fails" },
        ],
      },
    },
    {
      term: "TLS and mutual TLS (mTLS)",
      plain:
        "TLS is what secures a normal HTTPS connection — the server proves its identity with a certificate, so you know you're really talking to who you think you are. Mutual TLS adds the same requirement in the other direction: the client has to prove its identity too.",
      visual: {
        kind: "side-by-side",
        leftLabel: "TLS (one-way)",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "c1", label: "Client", col: 0 },
            { id: "s1", label: "Server", col: 1 },
          ],
          edges: [{ from: "c1", to: "s1", label: "server proves its identity" }],
        },
        rightLabel: "Mutual TLS",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "c2", label: "Client", col: 0 },
            { id: "s2", label: "Server", col: 1 },
          ],
          edges: [
            {
              from: "c2",
              to: "s2",
              direction: "both",
              label: "server proves identity",
              labelReverse: "client proves identity too",
            },
          ],
        },
      },
    },
    {
      term: "Observability / distributed tracing",
      plain:
        "Observability means being able to see what actually happened inside a system after the fact, instead of guessing. Distributed tracing records one request's full journey across every service it touched, so you can see exactly which hop was slow or where it broke.",
      visual: {
        kind: "timeline",
        totalDuration: 0.3,
        unit: "s",
        segments: [
          { id: "recv", label: "request received", start: 0, duration: 0, color: "default", description: "The Orchestrator's BookFlight span begins." },
          { id: "user", label: "validate user", start: 0, duration: 0.05, color: "default", description: "A child span for the outbound call to the User service." },
          { id: "search", label: "call Search", start: 0.05, duration: 0.15, color: "default", description: "A child span for the outbound call to Search — the longest segment, and the first place a slowdown would show up." },
          { id: "resp", label: "response sent", start: 0.25, duration: 0, color: "success", description: "The full trace, visible end-to-end in Jaeger as one connected timeline." },
        ],
      },
    },
  ],

  overview: [
    "Three services model a tiny flight-booking system, talking to each other over gRPC. An Orchestrator receives a booking request and coordinates two others: a User service that checks whether the user is allowed to book, and a Search service that returns flight options.",
    "The actual point of the project isn't the booking logic — it's everything wrapped around those calls: retries with backoff and a circuit breaker for when Search starts failing, mutual TLS securing the inter-service hops, and OpenTelemetry traces plus Prometheus/Grafana metrics so there's an actual trail to look at when something goes wrong, not just silence. One thing worth saying plainly: mTLS genuinely secures two of the three connections in this system, not all of them — covered honestly in the decisions below rather than smoothed over.",
  ],

  diagram: {
    viewBox: "0 0 820 260",
    nodes: [
      { id: "client", label: "Test Client", x: 20, y: 100, width: 150 },
      { id: "orchestrator", label: "Orchestrator :50053", x: 230, y: 100, width: 190 },
      { id: "user", label: "User Service :50051", x: 500, y: 20, width: 180 },
      { id: "search", label: "Search Service :50052", x: 500, y: 180, width: 190 },
    ],
    edges: [
      { from: "client", to: "orchestrator", label: "insecure gRPC" },
      { from: "orchestrator", to: "user", label: "mTLS + retry" },
      { from: "orchestrator", to: "search", label: "mTLS + retry + breaker" },
    ],
    details: {
      client: {
        title: "Test client",
        plain: "The script standing in for a real caller — connects straight to the Orchestrator with no encryption on this hop at all.",
        techDetail: "clients/orchestrator_client.py — `grpc.insecure_channel('localhost:50053')`. No certs, no TLS, plaintext gRPC.",
      },
      orchestrator: {
        title: "Orchestrator service",
        plain: "The coordinator. It validates the user first, and only calls Search if that succeeds — so a failing User check means Search never even gets contacted for that request.",
        techDetail: "services/orchestrator_server.py:260 — `server.add_insecure_port('[::]:50053')`. The orchestrator secures its own OUTBOUND calls to User and Search with mTLS, but its own INBOUND port has no TLS or client-cert verification at all.",
      },
      user: {
        title: "User service",
        plain: "Checks whether a user is allowed to book. In this project, that check is a stand-in stub, not a real lookup.",
        techDetail: "services/user_server.py:39 — `if user_id == \"123\": is_valid = True else: is_valid = False`. Secured with mTLS: `grpc.ssl_server_credentials(..., require_client_auth=True)`.",
      },
      search: {
        title: "Search service",
        plain: "Returns flight options — a simple RPC for a one-shot result, and a streaming RPC that sends results one at a time with a real delay between each.",
        techDetail: "Also secured with mTLS (require_client_auth=True). Contains a commented-out 50%-random-failure block used to manually test the circuit breaker.",
      },
    },
  },

  flow: [
    { title: "A booking request arrives", plain: "The client calls the Orchestrator's BookFlight method over an unencrypted connection — the orchestrator's own inbound port has no TLS." },
    { title: "The Orchestrator checks the user first — over a secured connection", plain: "It opens its own outbound connection to the User service, protected with mutual TLS, and asks whether this user is allowed to book. This call goes through retry logic, but not the circuit breaker." },
    { title: "An invalid user stops everything right here", plain: "If the User service says no, the Orchestrator returns failure immediately — Search is never contacted at all for this request." },
    { title: "The Orchestrator asks Search for flights — through both retry and the circuit breaker", plain: "This call is wrapped in two layers: retry and the circuit breaker. Crucially, retry wraps the circuit breaker, not the other way around — every one of the up-to-3 attempts re-checks the breaker's current state." },
    { title: "A successful result gets formatted and returned", plain: "Each returned flight gets turned into a readable line of text, and the Orchestrator responds with success and a formatted list." },
    { title: "Every step is being watched, whether it succeeds or fails", plain: "Each call is wrapped in its own trace span, and every service increments request/error counters and records latency — this is what makes the failure scenario below actually observable afterward." },
  ],

  decisions: [
    {
      title: "A hand-rolled circuit breaker, not a library — and it only wraps the Search call",
      plain: "The circuit breaker is plain Python, about 40 lines, tracking its own state machine. It's only applied to the call to Search, not to User validation or the streaming price feed.",
      alternative: "Use an existing circuit-breaker library, and/or apply it uniformly to every outbound call.",
      tradeoff: "Hand-rolling makes the exact behavior easy to see and reason about, at the cost of missing edge cases a mature library would handle. Only wrapping Search reflects that Search is the service deliberately made flaky for testing.",
      ifReversed: "A library would likely handle more edge cases correctly, but with less visibility into exactly what's happening and when.",
      techDetail: "3 failures trips it open, 10-second cooldown before a half-open probe. A failed half-open probe does NOT double-count against the threshold — it just re-opens using the count already at the threshold.",
      comparisonVisual: {
        kind: "side-by-side",
        leftLabel: "Without a circuit breaker",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "o1", label: "Orchestrator", col: 0 },
            { id: "s1", label: "Search (struggling)", col: 1 },
          ],
          edges: [{ from: "o1", to: "s1", label: "keeps calling every time" }],
        },
        rightLabel: "With a circuit breaker",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "o2", label: "Orchestrator", col: 0 },
            { id: "b2", label: "Breaker: OPEN", col: 1 },
            { id: "s2", label: "Search", col: 2 },
          ],
          edges: [
            { from: "o2", to: "b2" },
            { from: "b2", to: "s2", label: "rejected instantly", style: "blocked" },
          ],
        },
      },
    },
    {
      title: "Retry wraps the circuit breaker, not the other way around",
      plain: "Each of the retry loop's up-to-3 attempts calls through the circuit breaker fresh — meaning the breaker's state is re-checked on every single retry attempt, not just once before the whole sequence begins.",
      alternative: "Check the circuit breaker once, and only enter the retry loop at all if it's currently closed.",
      tradeoff: "The way it's built means a request can genuinely be the one that trips the breaker mid-retry, which is realistic. The cost: once open, a request still burns through all 3 retry attempts and their waits even though each is destined to fail instantly.",
      ifReversed: "Checking the breaker once up front would fail faster once it's known to be open, but a request could no longer be the one whose own retries trip it.",
      comparisonVisual: {
        kind: "side-by-side",
        leftLabel: "Check once, up front",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "r1", label: "Request arrives", col: 0 },
            { id: "r2", label: "Breaker checked once", col: 1 },
            { id: "r3", label: "3 retries run regardless", col: 2 },
          ],
          edges: [
            { from: "r1", to: "r2" },
            { from: "r2", to: "r3" },
          ],
        },
        rightLabel: "What was built: recheck every attempt",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "b1", label: "Attempt 1", col: 0 },
            { id: "b2", label: "Breaker checked", col: 1 },
            { id: "b3", label: "Attempt 2 → checked again", col: 2 },
          ],
          edges: [
            { from: "b1", to: "b2" },
            { from: "b2", to: "b3" },
          ],
        },
      },
    },
    {
      title: "mTLS secures the two inter-service hops — not the client-facing edge",
      plain: "Both the Orchestrator→User and Orchestrator→Search connections require both sides to present a valid certificate. The connection into the Orchestrator itself has none of that.",
      alternative: "Also put the Orchestrator's own inbound port behind mTLS (or at minimum TLS).",
      tradeoff: "As built, this project explored backend-to-backend trust specifically. In a real deployment the client-facing edge would typically sit behind its own protection (a load balancer or API gateway), which this project doesn't include.",
      ifReversed: "Securing every hop, including the client edge, would close this gap entirely — it just wasn't what got built here.",
      techDetail: "orchestrator_server.py:260, `server.add_insecure_port('[::]:50053')`, confirmed against the client's own `grpc.insecure_channel` in clients/orchestrator_client.py.",
    },
    {
      title: "User validation is a stub, on purpose — the point was the resilience patterns, not auth",
      plain: "\"Is this user valid\" is answered by comparing the user_id string to a single hardcoded value. There's no database, no real user store, no actual authentication behind it.",
      alternative: "Wire up a real user lookup, even a minimal one.",
      tradeoff: "Keeping User validation trivial kept the project's actual focus — circuit breakers, retries, mTLS, tracing, metrics — from getting diluted by an unrelated auth system.",
      ifReversed: "A real lookup would make the demo more realistic but wouldn't teach anything new about the resilience patterns this project set out to explore.",
      techDetail: "services/user_server.py:39 — `if user_id == \"123\":` is the entire check.",
    },
  ],

  failureScenario: {
    title: "Watching the circuit breaker actually trip",
    intro: "The Search service has a commented-out block that, when manually enabled, makes it fail randomly about half the time — built specifically so the circuit breaker's behavior could be observed directly.",
    steps: [
      { title: "1. The failure switch gets flipped on", plain: "A block at the top of Search's method gets manually uncommented: on every call, there's now roughly a 50% chance it throws an exception. There's no environment variable — it's a code comment toggled by hand." },
      { title: "2. A request hits bad luck on its first attempt", plain: "A booking request comes in, the user checks out fine, and the call to Search fails on the coin-flip. Retry catches this, waits 1 second, and tries again." },
      { title: "3. It fails again — wait doubles to 2 seconds", plain: "Second attempt also loses the coin flip. The backoff logic doubles the wait before the next, final attempt." },
      { title: "4. The third attempt fails too — and this is the one that trips the breaker", plain: "Because every retry attempt goes through the circuit breaker fresh, this single request's own 3 failures push the failure count to its threshold. Right as this request gives up, the breaker flips to OPEN for the next 10 seconds." },
      { title: "5. The very next request never reaches the network at all", plain: "A new booking request arrives moments later. The breaker sees it's OPEN and immediately raises \"Circuit is OPEN. Skipping call\" — no network call happens." },
      { title: "6. But it still waits — an interesting, slightly wasteful nuance", plain: "This new request still burns through all 3 retry attempts and their waits, even though every one is destined to fail instantly. The client experiences roughly 3 seconds of waiting for a request that never once touched Search." },
      { title: "7. Ten seconds later, one request gets to test the waters", plain: "Once 10 seconds have passed, the next call is let through as a single probe (HALF_OPEN). Success fully resets the breaker; another failure reopens it immediately without incrementing the count again." },
      { title: "8. What shows up in Jaeger and Grafana", plain: "A cluster of failed BookFlight traces right as the breaker trips, followed by unusually fast failures with no real backend latency — because Search is never actually being called during that stretch." },
    ],
  },

  codeSnippets: [
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
        "Two honest limitations worth seeing in the actual code — the orchestrator secures its outbound calls but not its own inbound port, and \"user validation\" is a placeholder, not real logic.",
    },
  ],

  futureWork: [
    "Secure the orchestrator's own inbound port (client-facing edge) with TLS, not just its outbound calls to User and Search",
    "Apply the circuit breaker to the User-service call path too, not only Search",
    "Add centralized configuration through environment variables or a typed config file, instead of hardcoded values scattered across each service",
    "Add health checks and readiness probes so each service could be monitored and restarted safely if this were containerized",
    "Add request deadlines and graceful shutdown handling for more predictable behavior during failures and deploys",
    "Containerize the 3 gRPC services themselves — currently only the observability stack runs under Docker Compose; the services run as local Python processes",
  ],

  glossary: [
    { term: "gRPC", definition: "A framework for one program to call another program's functions directly across a network, defined by a shared contract — closer to a phone call than passing messages over a web API." },
    { term: "Mutual TLS (mTLS)", definition: "A secure connection where both sides prove who they are with a certificate, not just the server the way a normal HTTPS website does." },
    { term: "Circuit breaker", definition: "A safety switch: if a service keeps failing, stop sending it more requests for a while instead of hammering something that's already struggling." },
    { term: "Exponential backoff", definition: "Waiting progressively longer between retry attempts instead of retrying instantly and repeatedly." },
    { term: "Server-side streaming", definition: "An RPC that sends back a series of results one at a time as they become available, instead of one single, complete response." },
    { term: "Distributed tracing", definition: "A record of a single request's full journey across multiple services, so you can see exactly which step something happened in and how long it took." },
  ],
};
