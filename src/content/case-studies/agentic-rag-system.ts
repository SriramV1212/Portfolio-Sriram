import type { CaseStudy } from "./types";

export const agenticRagSystem: CaseStudy = {
  hook:
    "An AI agent is only as trustworthy as the boundary around what it's allowed to touch. This project explores a specific version of that problem: what happens when an agent's only path to real data is through tools it doesn't control — and how do you actually prove, after the fact, that it stayed inside that boundary?",

  foundations: [
    {
      term: "API",
      plain:
        "An API is just a way for two programs to talk to each other — one side sends a request, the other sends back a response. This project's frontend sends a question to a `/ask` endpoint and gets an answer back.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "client", label: "Client", col: 0 },
          { id: "server", label: "FastAPI /ask", col: 1 },
        ],
        edges: [
          {
            from: "client",
            to: "server",
            direction: "both",
            label: "sends a question",
            labelReverse: "sends back an answer",
          },
        ],
        caption: "The one public entry point this whole system exposes.",
      },
    },
    {
      term: "Database vs. vector database",
      plain:
        "A normal database finds rows by exact match — search for \"rate limit\" and you only get rows containing those exact words. A vector database searches by meaning instead, so a question about rate limits can still find a passage about \"request throttling\" even though they don't share a word.",
      visual: {
        kind: "side-by-side",
        leftLabel: "Normal database — exact match",
        left: {
          kind: "table",
          columns: ["chunk", "text"],
          states: [
            {
              label: "search: \"rate limit\"",
              rows: [
                { cells: ["#12", "\"...avoid getting rate limited...\""], highlight: "success" },
                { cells: ["#47", "\"...request throttling helps avoid 429s...\""], highlight: "reject" },
              ],
              note: "Only the row with the literal words \"rate limit\" matches — the throttling row is just as relevant, but never gets found.",
            },
          ],
        },
        rightLabel: "Vector database — meaning match",
        right: {
          kind: "cluster",
          clusterColors: { limits: "fill-emerald-400", auth: "fill-sky-400" },
          points: [
            { id: "p1", label: "rate limited", cluster: "limits", x: 90, y: 70 },
            { id: "p2", label: "request throttling", cluster: "limits", x: 130, y: 90 },
            { id: "p3", label: "429 errors", cluster: "limits", x: 105, y: 115 },
            { id: "p4", label: "API key auth", cluster: "auth", x: 230, y: 40 },
            { id: "p5", label: "bearer tokens", cluster: "auth", x: 255, y: 65 },
          ],
        },
      },
    },
    {
      term: "Embedding",
      plain:
        "An embedding is what a vector database actually stores: each piece of text gets converted into a list of numbers that captures what it means. Text with similar meaning ends up with numbers that are mathematically close together — so \"close in meaning\" becomes \"close on a map.\"",
      visual: {
        kind: "cluster",
        clusterColors: { animals: "fill-emerald-400", vehicles: "fill-sky-400" },
        points: [
          { id: "dog", label: "dog", cluster: "animals", x: 80, y: 60 },
          { id: "puppy", label: "puppy", cluster: "animals", x: 105, y: 85 },
          { id: "cat", label: "cat", cluster: "animals", x: 60, y: 100 },
          { id: "car", label: "car", cluster: "vehicles", x: 220, y: 60 },
          { id: "truck", label: "truck", cluster: "vehicles", x: 250, y: 90 },
          { id: "bike", label: "bicycle", cluster: "vehicles", x: 215, y: 120 },
        ],
        caption:
          "Click any point — it's grouped with the other points closest to it in meaning, not by shared letters or words.",
      },
    },
    {
      term: "Retrieval / semantic search",
      plain:
        "Semantic search means turning a question into that same kind of number-list, then finding the document chunks whose numbers are closest to it. This is how the system finds a passage about \"throttling\" from a question that never uses that word.",
      visual: {
        kind: "cluster",
        clusterColors: { limits: "fill-emerald-400" },
        points: [
          { id: "q", label: "your question", cluster: "limits", x: 60, y: 40, isQuery: true, nearestId: "t1", nearestLabel: "request throttling" },
          { id: "t1", label: "request throttling", cluster: "limits", x: 150, y: 70 },
          { id: "t2", label: "429 errors", cluster: "limits", x: 175, y: 100 },
          { id: "t3", label: "pagination", cluster: "limits", x: 260, y: 130 },
        ],
        caption: "Click the diamond (your question) to see which stored passage it lands closest to.",
      },
    },
    {
      term: "LLM, and its core limitation",
      plain:
        "An LLM (large language model) is the AI doing the actual writing. Left alone, it can only answer from what it memorized during training — and it can guess confidently even when it's wrong, with no visible difference between a fact and a fluent-sounding mistake.",
      visual: {
        kind: "side-by-side",
        leftLabel: "Without real documents",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "q1", label: "Question", col: 0 },
            { id: "m1", label: "Model guesses from memory", col: 1 },
            { id: "a1", label: "Answer (maybe wrong)", col: 2 },
          ],
          edges: [
            { from: "q1", to: "m1" },
            { from: "m1", to: "a1" },
          ],
        },
        rightLabel: "With real documents (RAG)",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "q2", label: "Question", col: 0 },
            { id: "m2", label: "Model reads real docs first", col: 1 },
            { id: "a2", label: "Answer (grounded)", col: 2 },
          ],
          edges: [
            { from: "q2", to: "m2" },
            { from: "m2", to: "a2" },
          ],
        },
      },
    },
    {
      term: "RAG (Retrieval-Augmented Generation)",
      plain:
        "RAG just means combining the two ideas above: retrieve the real passages that match the question by meaning, then have the model read those before answering, instead of relying on memory alone.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "q", label: "Question", col: 0 },
          { id: "s", label: "Search real docs", col: 1 },
          { id: "m", label: "Model reads matches", col: 2 },
          { id: "a", label: "Answer, with citations", col: 3 },
        ],
        edges: [
          { from: "q", to: "s" },
          { from: "s", to: "m" },
          { from: "m", to: "a" },
        ],
      },
    },
    {
      term: "Agent / tool use",
      plain:
        "An \"agent\" is a language model that's been given tools (functions) it can call, and instructions on how to use them — instead of just being asked a question and writing text back, it can decide to go fetch information first.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "m", label: "Model", col: 0 },
          { id: "t", label: "Calls a tool", col: 1 },
          { id: "a", label: "Answers using the result", col: 2 },
        ],
        edges: [
          { from: "m", to: "t", label: "decides to" },
          { from: "t", to: "a", label: "gets real data back" },
        ],
      },
    },
    {
      term: "MCP (Model Context Protocol)",
      plain:
        "MCP is a standard way to hand an agent a fixed set of tools and nothing else — like giving someone a remote control with exactly four buttons instead of the keys to the whole building. This project's agent can search, but it has no other way to reach the document database.",
      visual: {
        kind: "pipeline",
        nodes: [
          { id: "agent", label: "Agent", col: 0, row: 0 },
          { id: "db", label: "Document database", col: 2, row: 0 },
          { id: "mcp", label: "MCP: 4 tools only", col: 1, row: 1 },
        ],
        edges: [
          { from: "agent", to: "db", label: "no direct access", style: "blocked" },
          { from: "agent", to: "mcp" },
          { from: "mcp", to: "db" },
        ],
        caption: "The top path doesn't exist for the agent — the only way through is the 4 tools MCP exposes.",
      },
    },
  ],

  overview: [
    "This is a documentation Q&A system for Anthropic's API docs — ask something like \"how does prompt caching work?\" and it searches the real docs, reads the matching passages, and answers only from those, citing exactly where each claim came from.",
    "The interesting engineering problem is the boundary around that search: the agent has zero database credentials and can only reach the documents through the 4-tool MCP server above — not a rule it's asked to follow, but a wall it's architecturally unable to get around. The whole stack (FastAPI, the MCP server, and a self-hosted Qdrant vector database) runs on a real VPS under systemd, with a Next.js frontend showing a \"retrieval inspector\" panel — exactly which passages were retrieved and how confident the match was, so the answer isn't a black box.",
  ],

  diagram: {
    viewBox: "0 0 820 260",
    nodes: [
      { id: "client", label: "Client", x: 20, y: 100, width: 130 },
      { id: "fastapi", label: "FastAPI /ask", x: 220, y: 100, width: 150 },
      { id: "agent", label: "OpenClaw Agent", x: 460, y: 20, width: 160 },
      { id: "mcp", label: "MCP Server (4 tools)", x: 460, y: 180, width: 160 },
      { id: "qdrant", label: "Qdrant vector DB", x: 680, y: 180, width: 140 },
    ],
    edges: [
      { from: "client", to: "fastapi", label: "POST /ask" },
      { from: "fastapi", to: "agent", label: "asks" },
      { from: "agent", to: "mcp", label: "tool call" },
      { from: "fastapi", to: "mcp", label: "direct verify call", dashed: true },
      { from: "mcp", to: "qdrant", label: "vector search" },
    ],
    details: {
      client: {
        title: "Client",
        plain:
          "Whoever's asking a question — the Next.js frontend's retrieval-inspector page, or a direct curl request. Either way, all it sends is a single question string.",
      },
      fastapi: {
        title: "FastAPI — POST /ask",
        plain:
          "The one public entry point. It rejects empty questions outright, then does something a little unusual: it asks the agent for an answer, and independently asks the same search tool a question of its own — at the same time, not one after the other.",
        techDetail:
          "main.py:156-197. Empty/whitespace question → HTTPException(400). Otherwise runs `asyncio.gather(_search_kb_direct(question), _ask_agent(client, question))` — both awaited concurrently, not sequentially.",
      },
      agent: {
        title: "OpenClaw Agent",
        plain:
          "The language model doing the actual reasoning. It's instructed (in a system prompt called SOUL.md) to always search before answering, to only use what it finds, to cite every claim, and to refuse to answer when its search results look weak.",
        techDetail:
          "Reached via POST to the OpenClaw Gateway's OpenAI-compatible /v1/chat/completions endpoint (main.py:112-134). A non-200 response or an empty `choices` array both raise HTTPException(502).",
      },
      mcp: {
        title: "MCP Server (4 tools)",
        plain:
          "This is the only door into the document database. It exposes exactly 4 functions — search, get one document by ID, list all topics, and find related documents — and nothing else. The agent has no other way to reach the data, by design.",
        techDetail:
          "mcp_server/server.py. Tools: search_kb (embeds the query, cosine search via QdrantClient.query_points, top_k=4 default), get_source (direct retrieve by point ID), list_sections (paginated scroll, 512/page, dedupes into a sorted set), get_related (fetches a chunk's stored vector, re-searches for neighbors, filters the chunk itself out).",
      },
      qdrant: {
        title: "Qdrant vector database",
        plain:
          "Where the actual document chunks and their \"meaning fingerprints\" (embeddings) are stored. This is what makes the meaning-based search possible — it never sees or is reachable from the agent directly, only through the MCP server.",
        techDetail:
          "Self-hosted via Docker Compose (the only containerized piece of this repo's own stack — FastAPI and the MCP server both run as native systemd-managed processes on the VPS, not in Docker). Collection: cosine distance, 768-dim vectors from nomic-ai/nomic-embed-text-v1.",
      },
    },
  },

  flow: [
    {
      title: "The question arrives",
      plain:
        "A question hits POST /ask. If it's empty or just whitespace, FastAPI rejects it immediately with a 400 error.",
    },
    {
      title: "Two searches happen at once, for two different reasons",
      plain:
        "FastAPI kicks off two things simultaneously: the agent gets asked to answer (and will search internally as part of that), and FastAPI separately, independently, asks the same search tool the same question on its own.",
      detail:
        "The reason for the second search is explained in the failure scenario below — short version: the platform doesn't expose what the agent searched for internally, so FastAPI reruns the search itself to have real data for the retrieval-inspector panel.",
    },
    {
      title: "The search itself: meaning, not words",
      plain:
        "Inside the MCP server, the question is converted into an embedding using the same model the documents were indexed with, and Qdrant finds the closest chunks — the semantic search described above.",
    },
    {
      title: "Deciding whether to trust the answer at all",
      plain:
        "Before returning anything, FastAPI checks two independent signals: did the agent's own answer contain its mandated refusal sentence, or is the best match's confidence score below a cutoff? Either one alone is enough to flag the answer as unreliable.",
    },
    {
      title: "FastAPI overrules the model, on purpose",
      plain:
        "If either signal fires, FastAPI throws away whatever the model actually produced and replaces it with one fixed, honest sentence. This is a direct response to something observed in testing: the model didn't always follow its own \"refuse when unsure\" instruction reliably.",
    },
    {
      title: "Citations only attach when they can be proven",
      plain:
        "A retrieved passage only gets listed as a citation if its exact section heading literally appears as text inside the answer — a deliberately strict rule, since a looser check could credit the wrong section.",
    },
  ],

  decisions: [
    {
      title: "MCP as the only door in, not a convention the agent is asked to follow",
      plain:
        "The agent has zero database credentials. It can't query Qdrant directly even if it wanted to — its entire universe of possible actions is the 4 functions the MCP server hands it.",
      alternative:
        "Give the agent a database connection string or a direct query tool and just instruct it (in its prompt) to only use approved queries.",
      tradeoff:
        "An instruction is a suggestion, not a guarantee — a confused or manipulated model could go around it. MCP costs more upfront wiring, but the boundary is architectural, not requested.",
      ifReversed:
        "If the agent had direct DB access, \"the agent can only retrieve through MCP\" would become a claim about behavior, not a fact about what's possible.",
      techDetail:
        "Confirmed via a standalone test_client.py that calls all 4 MCP tools directly against the server, independent of the agent — proving the tools work as advertised on their own.",
      comparisonVisual: {
        kind: "side-by-side",
        leftLabel: "Asked nicely (instruction only)",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "a1", label: "Agent", col: 0 },
            { id: "d1", label: "Database", col: 1 },
          ],
          edges: [{ from: "a1", to: "d1", label: "\"please only run approved queries\"", style: "dashed" }],
        },
        rightLabel: "MCP (what was built)",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "a2", label: "Agent", col: 0, row: 0 },
            { id: "db2", label: "Database", col: 2, row: 0 },
            { id: "mcp2", label: "MCP: 4 tools", col: 1, row: 1 },
          ],
          edges: [
            { from: "a2", to: "db2", style: "blocked" },
            { from: "a2", to: "mcp2" },
            { from: "mcp2", to: "db2" },
          ],
        },
      },
    },
    {
      title: "A second, independent search call — to make the transparency panel honest",
      plain:
        "The retrieval-inspector panel can't just ask the agent \"what did you look up?\" — so FastAPI reruns essentially the same search itself and shows that.",
      alternative:
        "Try to capture the agent's own internal tool-call result directly from the platform running it.",
      tradeoff:
        "This only works if the agent searches using the user's exact question text — a rule written into its instructions, not something the code can force. That's a real, disclosed residual risk.",
      ifReversed:
        "Without the independent call, the retrieval-inspector panel would have no real data to show — the platform doesn't currently expose the agent's internal tool calls.",
    },
    {
      title: "Letting code overrule the model's own words",
      plain:
        "When the system decides an answer isn't well-grounded, it doesn't hope the model phrases its uncertainty well — it deletes whatever the model said and substitutes one fixed, pre-written sentence.",
      alternative: "Trust the language model's own refusal wording when it decides to decline.",
      tradeoff:
        "Trusting the model is more flexible, but it was directly observed, in testing, not doing that reliably — on at least one occasion the model answered from general knowledge instead of admitting weak results.",
      ifReversed:
        "Without the override, users would occasionally get a confidently-worded answer that was never actually backed by the retrieved documents.",
      techDetail: "main.py:182-190. Two testing observations are cited directly in the code comments as the reason this exists.",
      comparisonVisual: {
        kind: "side-by-side",
        leftLabel: "Trust the model's wording",
        left: {
          kind: "pipeline",
          nodes: [
            { id: "m1", label: "Model answers", col: 0 },
            { id: "u1", label: "Shown to user as-is", col: 1 },
          ],
          edges: [{ from: "m1", to: "u1" }],
        },
        rightLabel: "Code overrules if unsure",
        right: {
          kind: "pipeline",
          nodes: [
            { id: "m2", label: "Model answers", col: 0 },
            { id: "c2", label: "Code checks confidence", col: 1 },
            { id: "u2", label: "Fixed honest sentence if weak", col: 2 },
          ],
          edges: [
            { from: "m2", to: "c2" },
            { from: "c2", to: "u2" },
          ],
        },
      },
    },
    {
      title: "Shipping an honest, unvalidated confidence threshold instead of blocking on a perfect one",
      plain:
        "The cutoff for \"this search result isn't good enough to answer from\" is a single number, set from a small manual test — and the project says so, out loud, in its own instructions to the agent.",
      alternative:
        "Hold off shipping any abstention behavior until a properly calibrated, statistically validated threshold exists.",
      tradeoff:
        "A calibrated threshold is the better long-term answer, but needs far more labeled test data than a small project starts with. Shipping a documented best-guess threshold means the system behaves sensibly now, while being explicit the number is provisional.",
      ifReversed:
        "With no threshold check at all, a weak, barely-related search result would still get handed to the model as if it were solid grounding.",
      techDetail:
        "The threshold is 0.6, set from an 8-in-corpus/2-off-corpus manual test where in-corpus top scores landed 0.64-0.90 and off-corpus 0.43-0.56 — explicitly logged in the agent's own instructions as \"a KNOWN INTERIM HEURISTIC, not a validated threshold.\" Worth flagging: the MCP search_kb tool's own docstring still says \"if every returned score is below 0.4\" — an older value from before the threshold was raised to 0.6, never updated to match.",
    },
    {
      title: "Deploying to a real, always-on server — not just a docker-compose demo",
      plain:
        "The backend runs on an actual VPS under systemd, the same process-supervision tool real Linux servers use, so it survives crashes and reboots without someone babysitting a terminal.",
      alternative: "Run everything in the foreground during a demo, or rely on a bare `docker compose up` with no restart policy.",
      tradeoff:
        "Real process supervision and CI/CD take more setup than a local demo, but the payoff is a system that's actually reachable and self-healing.",
      ifReversed:
        "A foreground process dies the instant its SSH session disconnects, with nothing bringing it back.",
      techDetail:
        "fastapi.service: Restart=always. mcp-server.service: Restart=on-failure, RestartSec=5. Deploys via a GitHub Actions self-hosted runner bound to that one VPS — it writes .env from GitHub Secrets on every push, with an explicit chmod 600 right after. It only restarts already-installed services; it never installs the systemd units or re-runs ingestion.",
    },
  ],

  failureScenario: {
    title: "The retrieval-inspector's honesty problem",
    intro:
      "This isn't a crash or an outage — it's a subtler kind of failure: a transparency feature whose correctness depends on an instruction being followed, not on something the code can enforce.",
    steps: [
      {
        title: "1. A question comes in",
        plain: "A user types a question. FastAPI kicks off the agent's answer and its own direct verification search at the same time.",
      },
      {
        title: "2. The agent is supposed to search with the exact question text",
        plain: "The agent's instructions tell it to pass the question to the search tool completely unmodified — no paraphrasing, no cleanup.",
        detail: "This is a plain-language rule in agent/SOUL.md, not something enforced by code — the whole mechanism depends on the model actually following it.",
      },
      {
        title: "3. The real gap: the platform can't show what the agent actually searched for",
        plain: "The gateway running the agent doesn't currently expose its internal tool-call results back out — there's no way to literally capture what it looked up.",
      },
      {
        title: "4. FastAPI's workaround: ask the same question again, separately",
        plain: "FastAPI runs its own independent search and shows that result instead. Since vector search is deterministic, this should match what the agent actually retrieved — as long as step 2 held true.",
      },
      {
        title: "5. What actually breaks this",
        plain: "If the agent ever rewords the question before searching — which nothing in the code prevents, only the instructions discourage — its real search and FastAPI's independent search would diverge.",
      },
      {
        title: "6. What an operator or user would actually observe",
        plain: "Nothing visibly breaks. There's no error message. The failure, if it happens, is silent: a plausible-looking but not-strictly-accurate picture of what grounded the answer.",
      },
    ],
  },

  codeSnippets: [
    {
      title: "Code overruling the model's own words",
      lang: "python",
      code: `low_confidence = not chunks or max(c["score"] for c in chunks) < THRESHOLD
abstained = (ABSTENTION_SENTENCE in answer) or low_confidence
if abstained:
    answer = ABSTENTION_SENTENCE`,
      explanation:
        "Two independent signals — the model's own refusal text, or the code's own confidence check — can force the exact same honest sentence back to the user, discarding whatever the model actually said.",
    },
    {
      title: "One of the agent's exactly 4 tools",
      lang: "python",
      code: `@mcp.tool()
def search_kb(query: str, top_k: int = 4) -> list[dict]:
    vector = embed_query(query)
    return qdrant.query_points(query=vector, limit=top_k).points`,
      explanation:
        "This is the entire surface area the agent has for reaching the document database — one of 4 functions, and nothing else.",
    },
  ],

  futureWork: [
    "Replace the fixed 0.6 abstention score cutoff with a relative-margin or learned-threshold approach — the project's own instructions already flag the current number as an interim heuristic from a 10-question manual test",
    "Fix the stale 0.4 value still referenced in the MCP search_kb tool's docstring, left over from before the real threshold was raised to 0.6",
    "Close the actual gap behind the retrieval-inspector workaround: capture the agent's own internal tool-call result directly once the gateway's tool-invoke endpoint supports it",
    "Add real automated test coverage — the existing verification scripts are genuinely useful but are manual/print-based smoke tests with no assert statements, not an automated pass/fail suite",
  ],

  glossary: [
    { term: "RAG (Retrieval-Augmented Generation)", definition: "Giving an AI model real documents to search and read before it answers, instead of letting it answer purely from what it memorized during training." },
    { term: "MCP (Model Context Protocol)", definition: "A standard way to give an AI model a fixed set of tools it's allowed to call — like handing it a remote control with a specific number of buttons and no others." },
    { term: "Vector database", definition: "A database that stores text as lists of numbers capturing what the text means, so it can find relevant results by meaning even when the wording is completely different." },
    { term: "Embedding", definition: "The list of numbers a piece of text gets converted into, capturing its meaning in a form a computer can compare against other text." },
    { term: "Agent", definition: "A language model that's been given tools it can call and instructions on how to use them, rather than just being asked a question directly." },
    { term: "Abstention", definition: "The system deliberately declining to answer instead of guessing, when it isn't confident its search actually found something relevant." },
  ],
};
