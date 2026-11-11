export const personal = {
  name: "Sriram Vivek",
  role: "Software Engineer",
  tagline:
    "I build reliable backend and distributed systems for financial infrastructure, with a focus on correctness, failure handling, and how systems behave beyond the happy path.",
  email: "sriramv1202@gmail.com",
  linkedin: "https://www.linkedin.com/in/sriram-vivek/",
  github: "https://github.com/SriramV1212",
  resumePdfPath: "/resume.pdf",
  photoPath: "/photo.jpg",
  formspreeFormId: "xaqrjzbd",
};

export const heroPhrases = [
  personal.role,
  "Problem Solving",
  "User-First Solutions",
  "Distributed Systems",
];

export const about = {
  paragraphs: [
    "I'm a software engineer focused on backend systems, distributed systems, and applied AI for financial infrastructure, particularly capital markets, banking, and payments, where correctness and reliability have direct consequences.",
    "At Galatea Associates I worked on an AI proof of concept for a financial services client, writing SQL against portfolio positions, optimizer constraints, and trade outputs, and building a RAG service that turned a 600-page optimizer specification into retrievable context for LLM-generated trade narratives.",
    "On my own, I've built an event-driven payment backend on Kafka and PostgreSQL with idempotent event processing and dead-letter handling, a gRPC microservices system with circuit breakers, retries, and mutual TLS across services, instrumented with OpenTelemetry, Prometheus, and Grafana so I can see how it behaves when something fails, and a deployed RAG system where a custom MCP server is the only data-access path for the agent.",
    "Right now I'm rebuilding the payment backend into a double-entry ledger: reproducing a dual-write gap between Postgres and Kafka with a crash-injection harness before fixing it, enforcing debits-equal-credits in the database rather than application code, and using property-based tests to try to break the invariants across generated operation sequences.",
    "I care most about systems where failures are expensive, correctness matters, and software has to be observable and recoverable.",
    "Outside of work, I'm a pretty big football (soccer) fan, I like cooking, gaming, and getting outside for sports when I can.",
    "I'm currently looking for Software Engineer, Backend Engineer, and AI Engineer roles focused on financial infrastructure.",
  ],
};

export type ExperienceEntry = {
  company: string;
  location: string;
  title: string;
  dates: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    company: "Galatea Associates LLC",
    location: "Boston, MA",
    title: "Financial Software Engineer Intern",
    dates: "June 2025 – August 2025",
    bullets: [
      "Contributed to a development-only LLM proof of concept for a financial services client that explains a portfolio optimizer's numeric trade suggestions in plain language.",
      "Wrote 3 multi-table SQL queries in MS SQL Server that fed the LLM suggested trades, industry allocations before and after optimization, and a benchmark comparison, all adopted into the product.",
      "Cut manual document searching for the team by building a RAG pipeline (LangChain, OpenAI embeddings, PGVector) over a 600-page optimizer specification that adds relevant behavior to the LLM prompt.",
    ],
  },
];

export type ProjectEntry = {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  githubUrl: string;
};

export const projects: ProjectEntry[] = [
  {
    slug: "payment-processing-backend",
    name: "Double-Entry Ledger and Payment Engine",
    description:
      "A payment system on Kafka and PostgreSQL that takes requests immediately, completes them in the background through Stripe (test mode), and stays correct under retries and crashes. API-level idempotency keys took 1,000 concurrent identical requests from 40 payments down to 1, a transactional outbox between PostgreSQL and Kafka recovers payments stranded by an API crash, and a double-entry ledger that rejects unbalanced entries keeps every payment fully accounted for, verified by 10 pytest integration tests.",
    tags: ["FastAPI", "Apache Kafka", "PostgreSQL", "Python", "Stripe"],
    githubUrl:
      "https://github.com/SriramV1212/Real-Time-Event-Driven-Payment-Processing-Backend",
  },
  {
    slug: "agentic-rag-system",
    name: "Agentic RAG System with Custom MCP Server",
    description:
      "A RAG agent on Qdrant that answers questions from Anthropic API docs and declines questions they don't cover. Every answer is grounded in retrieved sources because the agent is limited to 4 retrieval tools on a custom MCP server, and a Next.js dashboard surfaces the retrieved passages, similarity scores, and citations so users can verify answers. Deployed with GitHub Actions CI/CD to Vercel and a Linux server behind Nginx.",
    tags: [
      "Python",
      "MCP",
      "Qdrant",
      "FastAPI",
      "Docker",
      "Nginx",
      "Next.js",
      "TypeScript",
      "GitHub Actions",
    ],
    githubUrl: "https://github.com/SriramV1212/Agentic-RAG-System",
  },
  {
    slug: "microservices-resilience-engine",
    name: "Flight Booking Microservices System",
    description:
      "A flight booking backend of 3 Python microservices (User, Search, Orchestrator) over gRPC. Retries with exponential backoff raised booking success from 49% to 91.5% when half of Search calls failed, and a circuit breaker cut calls to a fully down service from 300 to 11 per 100 requests. Service-to-service calls are secured with mutual TLS, and distributed tracing (OpenTelemetry, Jaeger) plus metrics (Prometheus, Grafana) make slow requests debuggable.",
    tags: [
      "gRPC",
      "Protobuf",
      "OpenTelemetry",
      "Jaeger",
      "Prometheus",
      "Grafana",
      "Docker Compose",
    ],
    githubUrl:
      "https://github.com/SriramV1212/Distributed-Microservices-Orchestration-using-gRPC",
  },
];

export type SkillGroup = {
  category: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    category: "Development Tools",
    items: ["Claude Code CLI", "Codex", "Cursor", "Git"],
  },
  { category: "Programming Languages", items: ["Python", "SQL"] },
  { category: "Databases", items: ["PostgreSQL", "MS SQL Server", "Qdrant"] },
  {
    category: "Backend & Distributed Systems",
    items: [
      "FastAPI",
      "REST APIs",
      "gRPC",
      "Protocol Buffers",
      "Apache Kafka",
      "Event-driven architecture",
      "Microservices",
      "Transactional outbox",
      "Dead-letter queue (DLQ)",
      "pytest",
    ],
  },
  {
    category: "Infrastructure & Observability",
    items: [
      "AWS (S3, EC2, Lambda)",
      "Docker",
      "CI/CD (GitHub Actions)",
      "Linux",
      "Nginx",
      "systemd",
      "Prometheus",
      "Grafana",
      "Jaeger",
      "OpenTelemetry",
      "Distributed tracing",
    ],
  },
  {
    category: "Generative AI & LLMs",
    items: ["RAG", "LangChain", "Model Context Protocol (MCP)"],
  },
];

// A skill's display label doesn't always match its tag on a project card
// verbatim (e.g. the full skill name includes a parenthetical abbreviation).
const skillTagAliases: Record<string, string> = {
  "Model Context Protocol (MCP)": "MCP",
  "CI/CD (GitHub Actions)": "GitHub Actions",
};

const projectTags = new Set(projects.flatMap((project) => project.tags));

// Homepage skills-section pills: only skills actually tagged on one of the
// 3 featured projects, so this stays a proof of what was used, not a full
// resume-style skills inventory.
export const featuredSkills: string[] = skills
  .flatMap((group) => group.items)
  .filter((item) => projectTags.has(skillTagAliases[item] ?? item))
  .map((item) => skillTagAliases[item] ?? item);

export type EducationEntry = {
  school: string;
  location: string;
  degree: string;
  dates: string;
  courses: string;
  logo: string;
};

export const education: EducationEntry[] = [
  {
    school: "Stony Brook University",
    location: "New York, United States",
    degree:
      "Master of Science in Computer Science and Applied Mathematics (Data Science)",
    dates: "Aug 2024 – May 2026",
    courses:
      "Data Structures and Algorithms, Computer Networks, Programming Abstractions, Theory of Computation, Data Management, Big Data Systems, Big Data Analysis, Probability, Statistical Learning, Statistical Computing",
    logo: "/education/stony-brook.png",
  },
  {
    school: "SSN College of Engineering",
    location: "Chennai, India",
    degree: "Bachelor of Engineering in Electrical and Electronics Engineering",
    dates: "Nov 2020 – May 2024",
    courses:
      "Python Programming, Object-Oriented Programming, Linear Algebra and Calculus, Partial Differential Equations",
    logo: "/education/ssn.svg",
  },
];
