import type { RagCaseStudyContent } from "./types";

// Every specific claim below traces to the actual source of the two repos
// (SriramV1212/Agentic-RAG-System, SriramV1212/Grounded-Answer-Desk-Frontend),
// read directly during this session — main.py, mcp_server/server.py,
// mcp_server/embedder.py, ingestion/ingest.py, agent/SOUL.md,
// infra/{docker-compose.yml,systemd/*,scripts/setup-nginx-https.sh},
// .github/workflows/deploy.yml, README.md, and the frontend's
// lib/api.ts, lib/types.ts, app/components/{RetrievalInspector,
// AnswerPanel,ScoreBadge}.tsx — not the old placeholder write-up.
export const ragCaseStudy: RagCaseStudyContent = {
  hook:
    "Getting an LLM to produce an answer was not the part I found most interesting. The harder problem was deciding what evidence it was allowed to use, showing that evidence to the user, and making the application refuse an answer when retrieval was too weak.",

  subhook:
    "This is a Q&A system over Anthropic's API documentation. An agent retrieves through a custom MCP server backed by a Qdrant vector store, and FastAPI wraps that agent with a second, independent retrieval call and a deterministic abstention guard — so the model's confidence is never the only thing standing between a user and a wrong answer.",

  intro: [
    {
      text: "This is a retrieval-augmented generation (RAG) system: a question comes in through a FastAPI backend, which hands it to an OpenClaw agent. The agent's only path to real data is a set of four tools exposed by a custom MCP server, which embeds the query and searches a Qdrant collection of ingested Anthropic documentation. The agent grounds its answer in whatever comes back and is instructed to cite it.",
    },
    {
      text: "The frontend doesn't hide any of this. Alongside the answer, it renders a retrieval inspector — the actual chunks retrieved, their similarity scores, and their source URLs — so a reader can see the evidence the system is claiming to rely on, not just trust the prose.",
    },
    {
      text: "FastAPI adds one more layer: it calls the same retrieval tool a second time, independently of the agent, and uses that independent result to decide whether the evidence was strong enough to answer at all. If it wasn't, the application overrides the model's output — not because the model asked to be overridden, but because deterministic code, not the model, gets the final say. And the whole thing is deployed on a real VPS, not left running only on localhost.",
    },
  ],

  assumedKnowledge:
    "Assumed knowledge: basic APIs, Python services, and the general idea of an LLM. Embeddings, vector retrieval, RAG, MCP tool use, grounding, and abstention are explained where they affect this system.",

  invariants: {
    title: "What must remain true?",
    items: [
      {
        statement: "The agent retrieves documentation before answering.",
        status: "gap",
        statusLabel: "Behavioral rule",
      },
      {
        statement: "The agent has no direct access to Qdrant.",
        status: "protected",
        statusLabel: "Architecturally constrained",
      },
      {
        statement: "Weak retrieval does not result in a confident answer.",
        status: "protected",
        statusLabel: "Protected by FastAPI guard",
      },
      {
        statement: "The evidence shown to the user corresponds to the evidence the answer was actually grounded in.",
        status: "gap",
        statusLabel: "Known residual assumption",
      },
    ],
  },

  architecture: {
    title: "What the system actually looks like",
    intro: "There are two retrieval paths in this architecture, and that distinction matters later.",
    figure: {
      src: "/case-studies/rag/rag-system-architecture.png",
      alt: "Architecture diagram: User asks the Next.js frontend, which POSTs to FastAPI. FastAPI invokes the OpenClaw agent, which calls MCP tools that search Qdrant. FastAPI also independently calls search_kb on the MCP server. FastAPI assembles citations and applies the abstention guard, then responds to the frontend with the answer, citations, retrieved chunks, and abstained flag.",
      width: 1672,
      height: 941,
      caption: "The two retrieval paths this system runs on every question: the agent's own, and FastAPI's independent one.",
    },
    traceIntro: "Trace one request step by step, or reset to see the whole architecture.",
    trace: {
      viewBox: "0 0 1620 580",
      nodes: [
        { id: "user", label: ["User"], icon: "user", color: "zinc-300", x: 110, y: 380 },
        { id: "nextjs", label: ["Next.js Frontend", "(Vercel)"], icon: "monitor", color: "emerald-400", x: 480, y: 380 },
        { id: "fastapi", label: ["FastAPI Backend", "/ask"], icon: "braces", color: "emerald-400", x: 850, y: 380 },
        { id: "agent", label: ["OpenClaw", "Agent"], icon: "robot", color: "violet-400", x: 1170, y: 140 },
        { id: "mcp", label: ["MCP Server", "/mcp"], icon: "plug", color: "sky-400", x: 1490, y: 140 },
        { id: "qdrant", label: ["Qdrant", "anthropic_docs"], icon: "database", color: "red-400", x: 1490, y: 440 },
      ],
      edges: [
        { id: "e1", from: "user", to: "nextjs", label: ["ask question"] },
        { id: "e2", from: "nextjs", to: "fastapi", label: ["POST /ask"], parallelOffset: -16 },
        { id: "e3", from: "fastapi", to: "nextjs", label: ["answer +", "citations"], parallelOffset: -16 },
        { id: "e4", from: "fastapi", to: "agent", label: ["invoke agent"] },
        { id: "e5", from: "fastapi", to: "mcp", label: ["independent", "search_kb"], parallelOffset: -16, dashed: true },
        { id: "e6", from: "mcp", to: "fastapi", label: ["chunks +", "scores"], parallelOffset: -16, dashed: true },
        { id: "e7", from: "agent", to: "mcp", label: ["tool calls"], parallelOffset: -16 },
        { id: "e8", from: "mcp", to: "agent", label: ["ranked chunks"], parallelOffset: -16 },
        { id: "e9", from: "mcp", to: "qdrant", label: ["embed +", "search"], parallelOffset: -18 },
        { id: "e10", from: "qdrant", to: "mcp", label: ["chunks"], parallelOffset: -18 },
      ],
      trace: [
        {
          caption: "The question originates in the browser UI and is captured by the Next.js form.",
          nodeIds: ["user", "nextjs"],
          edgeIds: ["e1"],
        },
        {
          caption:
            "The frontend sends it straight from the browser to FastAPI — POST https://api.sriramv.tech/ask with a JSON body of {question}. There's no Next.js server route in between.",
          nodeIds: ["nextjs", "fastapi"],
          edgeIds: ["e2"],
        },
        {
          caption:
            "FastAPI starts two operations at once with asyncio.gather: one coroutine asks the OpenClaw agent to answer, the other independently calls the MCP server's search_kb tool with the same question. Neither waits on the other.",
          nodeIds: ["fastapi", "agent", "mcp"],
          edgeIds: ["e4", "e5"],
        },
        {
          caption:
            "The agent's own instructions (agent/SOUL.md) require it to call search_kb before attempting any answer, passed through the MCP tools it's been given — it has no other route to the data.",
          nodeIds: ["agent", "mcp"],
          edgeIds: ["e7"],
        },
        {
          caption:
            "search_kb embeds the question and runs a cosine-similarity vector search against the anthropic_docs Qdrant collection, returning up to top_k ranked chunks.",
          nodeIds: ["mcp", "qdrant"],
          edgeIds: ["e9"],
        },
        {
          caption:
            "The ranked chunks flow back through MCP to the agent, which grounds its answer in that retrieved text and is instructed to cite each claim's section heading and source URL.",
          nodeIds: ["qdrant", "mcp", "agent"],
          edgeIds: ["e10", "e8"],
        },
        {
          caption:
            "In parallel, FastAPI's own search_kb call — same question text, same top_k — completes independently. This is the data that becomes retrieved_chunks: it feeds the retrieval inspector, the abstention check, and citation assembly.",
          nodeIds: ["fastapi", "mcp", "qdrant"],
          edgeIds: ["e5", "e9", "e10", "e6"],
        },
        {
          caption:
            "FastAPI checks whether the agent's own text already contains its mandated refusal sentence, and separately checks whether the best independently-retrieved score clears 0.6. If either signal says the evidence is weak, FastAPI overwrites the answer with a fixed sentence — the model doesn't get the final word.",
          nodeIds: ["fastapi"],
          edgeIds: [],
        },
        {
          caption:
            "FastAPI responds with answer, citations, retrieved_chunks, and abstained. The frontend renders the answer panel and a retrieval inspector showing exactly what was retrieved and at what score.",
          nodeIds: ["fastapi", "nextjs"],
          edgeIds: ["e3"],
        },
      ],
    },
  },

  ingestion: {
    title: "Before any question can be answered",
    intro:
      "The request architecture above doesn't show how the knowledge base gets built — that happens once, ahead of time, not on the request path.",
    pipeline: {
      nodes: [
        { id: "docs", label: "Anthropic docs", col: 0 },
        { id: "chunk", label: "header-aware chunking", col: 1 },
        { id: "chunks", label: "~3,100 chunks", col: 2 },
        { id: "embed", label: "nomic-embed-text", col: 3 },
        { id: "qdrant", label: "Qdrant · anthropic_docs", col: 4 },
      ],
      edges: [
        { from: "docs", to: "chunk" },
        { from: "chunk", to: "chunks" },
        { from: "chunks", to: "embed" },
        { from: "embed", to: "qdrant" },
      ],
      caption:
        "ingestion/ingest.py downloads docs.anthropic.com/llms-full.txt, chunks it, embeds every chunk, and upserts into a freshly recreated Qdrant collection — a full run (including a first-time ~550MB model download) finishes in under a minute.",
    },
    paragraphs: [
      {
        text: "Chunking is header-aware, not a blind fixed-size split. The script splits each page on its ##/### Markdown headings first, then accumulates adjacent sections into a buffer until it lands in a 300–400 token target range (50-token overlap between chunks) — only a section that's individually oversized on its own gets pushed through a token-bounded fallback splitter. This keeps section_heading and parent_heading meaningful: they're the labels a reader sees in the retrieval inspector and the citations the agent produces, not an arbitrary character offset.",
      },
      {
        text: "Every chunk carries its source_url and heading metadata alongside its text, all the way through to Qdrant's payload — that's what lets a retrieved chunk be cited back to a real page, not just quoted anonymously.",
      },
      {
        text: "Retrieval itself is a cosine-similarity vector search over nomic-embed-text embeddings, not a keyword or full-text match. Lexical search emphasizes matching terms; vector similarity can rank passages by semantic proximity even when the phrasing differs — a question about \"rate limits\" can still surface a passage about \"request throttling.\" The corpus lands at roughly 3,100 chunks after this process, verified by a vector-count check (verify.py) in the 2,500–3,500 range.",
      },
    ],
  },

  boundary: {
    title: "The architectural boundary",
    intro: [
      {
        text: "\"Only use the approved tool\" is an instruction. It's not the same kind of guarantee as \"the credentials to do anything else don't exist.\" This project is built around that distinction.",
      },
    ],
    left: {
      label: "Instruction-only architecture",
      workingPath: {
        nodes: [
          { id: "agent", label: "Agent", col: 0 },
          { id: "tool", label: "approved tool", col: 1 },
          { id: "db", label: "Database", col: 2 },
        ],
        edges: [
          { from: "agent", to: "tool", label: "search()" },
          { from: "tool", to: "db", label: "query" },
        ],
        caption: "The path the prompt asks the agent to take.",
      },
      alsoPossiblePath: {
        nodes: [
          { id: "agent2", label: "Agent", col: 0 },
          { id: "client", label: "DB client + credentials", col: 1 },
          { id: "db2", label: "Database", col: 2 },
        ],
        edges: [
          { from: "agent2", to: "client", label: "still has access", style: "dashed" },
          { from: "client", to: "db2", label: "connects directly", style: "dashed" },
        ],
        caption: "A path the prompt asks it not to take — but that it's technically still able to.",
      },
      note: "A working client and real credentials sit right next to the model. Only a system prompt stands between the agent and using them directly.",
    },
    right: {
      label: "This project",
      workingPath: {
        nodes: [
          { id: "agent3", label: "Agent", col: 0 },
          { id: "mcp", label: "MCP tools", col: 1 },
          { id: "qdrant", label: "Qdrant", col: 2 },
        ],
        edges: [
          { from: "agent3", to: "mcp", label: "search_kb()" },
          { from: "mcp", to: "qdrant", label: "query" },
        ],
        caption: "The only path that exists.",
      },
      blockedPath: {
        nodes: [
          { id: "agent4", label: "Agent", col: 0 },
          { id: "qdrant2", label: "Qdrant", col: 2 },
        ],
        edges: [{ from: "agent4", to: "qdrant2", label: "no client, no credentials", style: "blocked" }],
        caption: "There's nothing here to call, even if the model wanted to.",
      },
      note: "The agent is only ever given the four MCP tools. It has no Qdrant client object and no Qdrant credentials in its environment — there's no direct route to bypass, not just one it's told not to take.",
    },
    lesson:
      "The model is still probabilistic — it can still misuse a tool, retrieve the wrong thing, or answer poorly. But which interfaces are even reachable from the agent's position is not a matter of the model's judgment; it's provisioning. This application exposes four retrieval tools through MCP, and the agent is not given another path to Qdrant.",
  },

  inspectorFidelity: {
    title: "The transparency feature has its own trust problem",
    intro: [
      {
        text: "Showing retrieved evidence looks like transparency. But that's only useful if the evidence shown is actually the evidence that grounded the answer — and this system doesn't currently prove that directly.",
      },
      {
        text: "FastAPI's retrieved_chunks field doesn't come from capturing the agent's own internal tool call. It comes from a second, independent search_kb call FastAPI makes itself, using the same question text and the same top_k the agent is expected to use. OpenClaw's deployed gateway doesn't currently expose the agent's own bundled MCP tool-call result through its /tools/invoke route, so there was no way to literally read back what the agent retrieved — this independent call is the substitute.",
      },
    ],
    matchingCase: {
      label: "The expected case: both searches use the same question",
      agent: {
        nodes: [
          { id: "q1", label: "question", col: 0 },
          { id: "a1", label: "OpenClaw", col: 1 },
          { id: "s1", label: "search_kb(query)", col: 2 },
          { id: "c1", label: "chunks A B C", col: 3 },
        ],
        edges: [
          { from: "q1", to: "a1" },
          { from: "a1", to: "s1" },
          { from: "s1", to: "c1" },
        ],
        caption: "Agent path",
      },
      inspector: {
        nodes: [
          { id: "q2", label: "question", col: 0 },
          { id: "f2", label: "FastAPI", col: 1 },
          { id: "s2", label: "search_kb(query)", col: 2 },
          { id: "c2", label: "chunks A B C", col: 3 },
        ],
        edges: [
          { from: "q2", to: "f2" },
          { from: "f2", to: "s2" },
          { from: "s2", to: "c2" },
        ],
        caption: "Inspector path",
      },
    },
    divergingCase: {
      label: "The residual risk: the agent doesn't search verbatim",
      agent: {
        nodes: [
          { id: "q3", label: "agent rewrites query", col: 0 },
          { id: "r3", label: "agent retrieval = A C D", col: 1 },
        ],
        edges: [{ from: "q3", to: "r3", style: "blocked" }],
        caption: "If the agent reformulates the question before searching",
      },
      inspector: {
        nodes: [
          { id: "q4", label: "FastAPI uses original query", col: 0 },
          { id: "r4", label: "inspector = A B C", col: 1 },
        ],
        edges: [{ from: "q4", to: "r4" }],
        caption: "POSSIBLE DIVERGENCE — inspector no longer matches",
      },
    },
    paragraphs: [
      {
        text: "Retrieval is deterministic given identical inputs — same query, same top_k, same index state, same model. That's exactly why agent/SOUL.md's rule 1 explicitly instructs the agent to pass the question to search_kb exactly as the user wrote it, without paraphrasing, rewriting, expanding, or correcting it first. If the agent reformulates the query before searching, its retrieval can diverge from FastAPI's independent one, and the inspector panel would show chunks that weren't actually what grounded the answer.",
      },
      {
        text: "So the honest claim isn't \"the retrieval inspector proves exactly what the model saw.\" It's narrower: the inspector is authoritative only if the agent actually searched using the exact same query and retrieval parameters FastAPI used — a rule the instructions enforce, but that nothing currently verifies after the fact. A feature built to make the system transparent still carries its own unverified assumption.",
      },
    ],
  },

  abstention: {
    title: "Grounding is also knowing when not to answer",
    intro: [
      {
        text: "FastAPI computes a low-confidence signal from the independently retrieved chunks: if there are none, or if the best cosine-similarity score among them falls below 0.6, the evidence is treated as too weak to answer from.",
      },
    ],
    table: {
      columns: ["Example", "Best similarity score", "Result"],
      states: [
        {
          label: "Illustrative examples",
          rows: [
            { cells: ["Strong retrieval", "0.82", "Answer"], highlight: "success" },
            { cells: ["Borderline", "0.64", "Answer"], highlight: "success" },
            { cells: ["Weak retrieval", "0.51", "Abstain"], highlight: "reject" },
          ],
          note: "Illustrative, not measured production examples. A similarity score is a ranking signal, not a calibrated probability — 0.82 does not mean \"82% confidence.\"",
        },
      ],
    },
    paragraphs: [
      {
        text: "0.6 is an explicitly disclosed interim heuristic, not a validated threshold — the project's own SOUL.md says so directly. It came from a single 10-question manual retrieval test (8 in-corpus, 2 off-corpus), where in-corpus top scores landed between 0.64 and 0.90 and off-corpus top scores landed between 0.43 and 0.56. 0.6 separates that one small sample better than an earlier 0.4 guess did — nothing more. It's planned to be replaced with a relative-margin or learned-threshold approach instead of a fixed cutoff.",
      },
    ],
  },

  codeOverrule: {
    title: "Code gets the final say",
    paragraphs: [
      {
        text: "Two independent abstention signals are OR'd together: the agent's own exact refusal sentence, and FastAPI's own check of the real retrieved_chunks scores. In testing, the agent didn't always reproduce its mandated refusal sentence verbatim even when scores were clearly low — on one off-corpus question it improvised a differently-worded refusal instead of quoting the required sentence, and on another it answered from general knowledge instead of abstaining at all. Trusting the model's own text alone wasn't reliable enough on its own.",
      },
      {
        text: "So when either signal says abstain, FastAPI overwrites the answer with the fixed sentence itself, regardless of what the model actually returned. The LLM doesn't get final authority over whether an answer is shown to the user — the application code does.",
      },
    ],
    code: {
      title: "The abstention override",
      lang: "python",
      code: `low_confidence = (
    not retrieved_chunks
    or max(c["score"] for c in retrieved_chunks) < ABSTENTION_SCORE_THRESHOLD
)
abstained = (ABSTENTION_SENTENCE in answer) or low_confidence

if abstained:
    answer = ABSTENTION_SENTENCE`,
      explanation: "main.py's /ask handler — the returned answer is guaranteed to be the refusal sentence whenever abstained is true, whether or not the model actually complied.",
    },
  },

  mcpTools: {
    title: "The four tools",
    intro: "Rather than an unrestricted Qdrant client, the agent gets four narrow, purpose-built tools.",
    table: {
      columns: ["Tool", "Purpose"],
      states: [
        {
          label: "search_kb, get_source, list_sections, get_related",
          rows: [
            { cells: ["search_kb", "Semantic retrieval for a question"] },
            { cells: ["get_source", "Fetch the exact stored text for one chunk by ID"] },
            { cells: ["list_sections", "List every topic the corpus covers"] },
            { cells: ["get_related", "Find chunks similar to a given chunk"] },
          ],
        },
      ],
    },
    paragraphs: [
      {
        text: "Narrow, named tools do two things a generic database client wouldn't: they make every possible tool call enumerable ahead of time, and they let the server enforce shape and behavior (embedding, ranking, payload fields) on every call, rather than trusting the agent to construct a correct query.",
      },
    ],
  },

  deployment: {
    title: "Making the system reachable",
    intro: [
      {
        text: "The backend works fully over plain HTTP — curl http://<vps-ip>:8000/ask is enough to exercise the whole system. Making it reachable from a browser-hosted, HTTPS-deployed frontend introduced two separate problems that don't show up when everything's local: mixed-content blocking, and CORS.",
      },
    ],
    topology: {
      nodes: [
        { id: "browser", label: "Browser (HTTPS)", col: 0 },
        { id: "nginx", label: "nginx + Certbot", col: 1 },
        { id: "fastapi", label: "FastAPI :8000", col: 2 },
        { id: "mcp", label: "MCP server :8001", col: 3 },
        { id: "qdrant", label: "Qdrant (Docker)", col: 4 },
      ],
      edges: [
        { from: "browser", to: "nginx", label: "HTTPS" },
        { from: "nginx", to: "fastapi", label: "proxy_pass" },
        { from: "fastapi", to: "mcp" },
        { from: "mcp", to: "qdrant" },
      ],
      caption:
        "FastAPI and the MCP server run as systemd services directly on the VPS (not containerized); only Qdrant runs via Docker Compose. A self-hosted GitHub Actions runner on the same VPS restarts both services and the separately-managed OpenClaw gateway container on every push to main — it never re-runs ingestion, which stays a deliberate manual step.",
    },
    paragraphs: [
      {
        text: "Nginx + Certbot exists only to solve mixed-content blocking: a browser won't let an HTTPS page (the Vercel-hosted frontend) call a plain-HTTP API, so a TLS-terminating reverse proxy sits in front of FastAPI's port 8000. It's explicitly optional in the project's own deployment docs — the backend is fully testable without it.",
      },
      {
        text: "CORS is a separate, always-on restriction: FastAPI's CORSMiddleware only allows requests from an explicit ALLOWED_ORIGINS allowlist read from the environment, not a wildcard — /ask has no auth of its own, so any origin would mean any website's JavaScript could call it on a visitor's behalf.",
      },
      {
        text: "Both FastAPI and the MCP server run as systemd services (Restart=always / Restart=on-failure) so they survive a disconnected SSH session or a reboot without anyone manually restarting them — the same reasoning that made systemd the right call for the payment backend's consumer process. Only Qdrant runs in Docker; the OpenClaw agent gateway runs as its own separately-managed container, registered once during onboarding rather than redeployed by this repo's own workflow.",
      },
    ],
  },

  decisions: {
    title: "A few decisions worth explaining",
    items: [
      {
        heading: "Why make MCP the retrieval boundary?",
        paragraphs: [
          {
            text: "The agent needed a way to reach Qdrant, and the easiest version of that would have been handing it a database client directly, gated by a prompt instruction not to misuse it. MCP made it possible to instead provision the agent with only four narrow tools and nothing else — turning \"please only use the approved tool\" from a convention into the only thing that's actually reachable.",
          },
          {
            label: "Alternative considered",
            text: "A direct Qdrant client passed into the agent's context, with the system prompt instructing it to only call an approved wrapper function around it.",
          },
          {
            label: "Tradeoff",
            text: "MCP adds a server process and a protocol hop that a direct client wouldn't need. What it buys back is that the restriction lives in what's provisioned, not in what the model is told — a distinction that matters precisely when the model doesn't behave as instructed.",
          },
        ],
      },
      {
        heading: "Why perform a second retrieval in FastAPI?",
        paragraphs: [
          {
            text: "The retrieval inspector, the abstention check, and citation assembly all need real chunk data with real scores — and OpenClaw's gateway doesn't expose the agent's own internal tool-call result through its /tools/invoke endpoint in the deployed version. An independent search_kb call was the practical way to get that data at all.",
          },
          {
            label: "Alternative considered",
            text: "Wait on an upstream gateway change that surfaces the agent's actual tool-call result, and block the retrieval inspector feature until it exists.",
          },
          {
            label: "Tradeoff",
            text: "This ships the feature now, at the cost of the fidelity assumption described above — the independent call is expected to match the agent's real retrieval, not proven to.",
          },
        ],
      },
      {
        heading: "Why let application code overrule the model?",
        paragraphs: [
          {
            text: "Testing surfaced real cases where the agent didn't reliably abstain even when it clearly should have — sometimes improvising a different refusal, sometimes answering anyway. An instruction the model can silently skip isn't a safeguard by itself.",
          },
          {
            label: "Alternative considered",
            text: "Trust the model's SOUL.md instructions alone, and treat the abstention sentence as the only signal.",
          },
          {
            label: "Tradeoff",
            text: "The override can occasionally suppress an answer the model actually got right, if the independent retrieval score happens to land under 0.6 on a real in-corpus question. Consistency was chosen over that risk.",
          },
        ],
      },
      {
        heading: "Why ship a provisional threshold?",
        paragraphs: [
          {
            text: "A cutoff derived from a 10-question manual test is still better than no abstention behavior at all, and shipping it honestly labeled as provisional was preferable to blocking the feature on a proper calibration effort.",
          },
          {
            label: "Alternative considered",
            text: "Hold off on any abstention guard until a larger, labeled retrieval-quality dataset existed to calibrate a real threshold.",
          },
          {
            label: "Tradeoff",
            text: "0.6 will misclassify some real questions near the boundary in both directions. The project's own docs already flag this and name the intended fix (a relative-margin or learned threshold) rather than presenting 0.6 as settled.",
          },
        ],
      },
      {
        heading: "Why deploy the system instead of stopping at localhost?",
        paragraphs: [
          {
            text: "A RAG pipeline that only runs in a notebook doesn't have to survive CORS, TLS, process restarts, or a real reverse proxy — problems that are trivial to wave away locally and very real the moment a browser on a different origin needs to call it.",
          },
          {
            label: "Alternative considered",
            text: "Demo the pipeline through a local script or notebook, with screenshots of a request/response pair.",
          },
          {
            label: "Tradeoff",
            text: "Deployment adds real operational surface — systemd units, an nginx config, a CORS allowlist, a CI workflow — that a local demo never has to get right. It's also the only way any of the transparency or abstention behavior described above is something a real visitor can actually exercise.",
          },
        ],
      },
    ],
  },

  codeProof: {
    title: "Code that proves the claim",
    items: [
      {
        title: "Answer generation and evidence retrieval run concurrently",
        lang: "python",
        code: `async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
    retrieved_chunks, answer = await asyncio.gather(
        _search_kb_direct(question),
        _ask_agent(client, question),
    )`,
        explanation:
          "main.py's /ask handler — the agent's answer and FastAPI's independent retrieval are two separate coroutines, not a wait-then-wait sequence.",
      },
      {
        title: "search_kb, the MCP tool the agent actually calls",
        lang: "python",
        code: `@mcp.tool()
def search_kb(query: str, top_k: int = 4) -> list[dict[str, Any]]:
    vector = embed_query(query)
    hits = _client.query_points(
        collection_name=QDRANT_COLLECTION,
        query=vector,
        limit=top_k,
        with_payload=True,
    ).points
    return [_point_to_result(hit.payload or {}, score=hit.score) for hit in hits]`,
        explanation:
          "mcp_server/server.py — embeds the query, runs a cosine-similarity vector search, and returns ranked chunks with scores and source metadata.",
      },
      {
        title: "The CORS allowlist",
        lang: "python",
        code: `ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)`,
        explanation:
          "main.py — an explicit origin allowlist from an environment variable, not a wildcard, since /ask has no auth of its own.",
      },
    ],
  },

  limitations: {
    title: "Where the guarantees stop",
    topics: [
      {
        heading: "Inspector fidelity isn't structurally guaranteed",
        paragraphs: [
          {
            text: "FastAPI's retrieved_chunks comes from an independent search_kb call, not a captured copy of what the agent itself retrieved. It's expected to match because retrieval is deterministic given identical input and the agent is instructed to search verbatim — but nothing currently verifies that the agent actually did.",
          },
        ],
      },
      {
        heading: "0.6 is provisional",
        paragraphs: [
          {
            text: "The abstention threshold came from a 10-question manual test, not a calibrated evaluation. It's disclosed as an interim heuristic in the project's own instructions, not presented as settled.",
          },
        ],
      },
      {
        heading: "Grounding still depends partly on instructions",
        paragraphs: [
          {
            text: "The architecture removes direct Qdrant access, which is a real constraint. But whether the agent calls search_kb first, uses the exact question text, cites correctly, and answers only from retrieved context is still governed by SOUL.md's instructions, not enforced by the runtime. This system doesn't make hallucination impossible — it makes certain kinds of it harder and easier to catch.",
          },
        ],
      },
      {
        heading: "Testing isn't a mature automated evaluation suite",
        paragraphs: [
          {
            text: "mcp_server/test_client.py is a manual verification script — it exercises all four tools and runs a fixed 10-question retrieval-quality check, printed for a human to read, with no assertions and no CI integration.",
          },
        ],
      },
      {
        heading: "A stale number in the MCP tool's own docstring",
        paragraphs: [
          {
            text: "search_kb's docstring still says \"if every returned score is below 0.4, the corpus likely doesn't contain a reliable answer\" — a leftover from before the threshold was raised to 0.6. The actual enforced cutoff, in both SOUL.md and main.py, is 0.6. This is a documentation inconsistency worth cleaning up, not the active behavior.",
          },
        ],
      },
    ],
  },

  openProblems: {
    title: "Open problems I want to validate next",
    items: [
      "Capture the agent's actual retrieval result directly, removing the independent-search fidelity assumption entirely.",
      "Build a labeled query/evidence set and run a real retrieval evaluation, instead of a 10-question manual spot check.",
      "Replace the fixed 0.6 cutoff with a relative-margin or learned-threshold approach, as already planned in the project's own docs.",
      "Turn the manual test scripts into an automated test suite with real assertions, wired into CI.",
      "Test and document behavior when Qdrant, the MCP server, or the OpenClaw gateway is unavailable or times out mid-request.",
      "Add real observability: retrieval latency, score distributions, abstention rate, MCP error rate, and end-to-end request latency.",
    ],
  },

  conclusion: {
    title: "What this project changed in how I think about AI systems",
    paragraphs: [
      {
        text: "Grounding turned out to be a system property, not a prompt instruction. The strongest guarantee in this project — no direct Qdrant access — comes from what's provisioned to the agent, not from what it's told. The weakest one — verbatim search, correct citation, honoring abstention — is still just an instruction, and testing showed instructions get skipped.",
      },
      {
        text: "Tool access and model instructions are different kinds of controls, and it's worth being precise about which one is actually doing the work in a given claim. \"The agent can only use these four tools\" is an architectural fact. \"The agent will always cite correctly\" is a hope backed by a system prompt.",
      },
      {
        text: "Transparency features need their own scrutiny. A retrieval inspector that shows the wrong chunks is arguably worse than no inspector at all, because it looks trustworthy while being subtly wrong. Building the feature honestly meant naming its own residual assumption, not just shipping the panel.",
      },
      {
        text: "A similarity score is a ranking signal, not a probability, and treating it as one would have made the abstention guard look more rigorous than it is. Its actual justification — a small manual test, explicitly labeled provisional — is more honest and, I think, more useful to a reader than a confident-sounding number would have been.",
      },
      {
        text: "And deployment turned an AI demo into a software system with ordinary engineering problems: networking, CORS, process supervision, TLS, and a redeploy workflow that has to survive a clean checkout wiping a gitignored .env file. None of that is specific to RAG or agents — it's just what happens once something has to actually be reachable.",
      },
    ],
  },

  glossary: [
    {
      term: "RAG",
      definition:
        "Retrieval-augmented generation — grounding an LLM's answer in text retrieved from an external source at request time, instead of relying only on what the model learned during training.",
    },
    {
      term: "Embedding",
      definition:
        "A learned numeric representation of text, used to compare semantic similarity between inputs.",
    },
    {
      term: "Vector similarity",
      definition:
        "Ranking passages by how close their embeddings are to a query's embedding, rather than by matching literal words.",
    },
    {
      term: "Qdrant",
      definition: "The vector database this project uses to store and search embedded documentation chunks.",
    },
    {
      term: "MCP",
      definition:
        "A protocol for exposing tools, resources, and context to AI applications through a standardized interface. In this project, the agent's retrieval tools are exposed through an MCP server.",
    },
    {
      term: "Agent",
      definition:
        "The OpenClaw-run LLM process that receives the question, calls tools to retrieve context, and produces the grounded answer.",
    },
    {
      term: "Tool call",
      definition: "An agent invoking one of its provisioned MCP tools (e.g. search_kb) as part of answering a question.",
    },
    {
      term: "Grounding",
      definition: "Basing an answer on specific retrieved evidence, rather than on the model's own unverified recall.",
    },
    {
      term: "Abstention",
      definition:
        "Deliberately refusing to answer when the available evidence is judged too weak to support a reliable response.",
    },
    {
      term: "Cosine similarity",
      definition:
        "A measure of the angle between two vectors, used here to score how closely a retrieved chunk's embedding matches the query's — a ranking signal, not a calibrated probability.",
    },
    {
      term: "Retrieval inspector",
      definition:
        "The frontend panel showing the actual chunks retrieved for a question, along with their similarity scores and source URLs.",
    },
  ],
};
