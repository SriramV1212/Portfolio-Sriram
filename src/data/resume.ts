export const personal = {
  name: "Sriram Vivek",
  role: "Software Engineer",
  tagline:
    "I build reliable backend and distributed systems, with a focus on correctness, failure handling, and how systems behave beyond the happy path.",
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
    "I started out in electrical engineering, switched to computer science, and spent the last couple years building my foundation in software from the ground up. I care about how things actually behave in production, and I try to think through failure scenarios at scale early in the design process. That shows up in a few things I've built on my own:",
    "My microservices project uses gRPC across three services, with circuit breakers, retries, mutual TLS between services, and OpenTelemetry/Prometheus/Grafana instrumentation so I can actually see how the system behaves when something fails. On my Kafka-based payment system, I built idempotent event handling and a dead-letter queue so a crash mid-transaction stays recoverable and visible.",
    "I also apply that same mindset to AI systems, specifically how to make them trustworthy in what they retrieve and how they act. At Galatea Associates, I built a retrieval pipeline turning a 600-page technical spec into something an LLM could use reliably. On my own, I built a full RAG system with a custom MCP server as the access layer to the underlying data, deployed and running end to end on a self managed infrastructure.",
    "Outside of work, I'm a pretty big football (soccer) fan, I like cooking, gaming, and getting outside for sports when I can.",
    "I'm currently looking for full-time software engineering roles, ideally somewhere I get to work on real infrastructure problems. Feel free to reach out.",
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
      "Built a RAG service as part of a development-only AI proof of concept for a financial services client, ingesting a 600-page portfolio optimizer specification to supply retrievable context for LLM-generated trade narratives.",
      "Built the document ingestion pipeline: PyMuPDF for text and table extraction, LangChain's recursive character splitter for chunking, and text-embedding-3-large for embeddings, stored in a PGVector store for similarity retrieval.",
      "Wrote SQL against MS SQL Server to extract and reshape portfolio positions, constraints, and trade outputs into structured tables for LLM prompt consumption.",
      "Authored technical documentation in Confluence and tracked deliverables in JIRA under Agile methodology.",
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
    slug: "agentic-rag-system",
    name: "Agentic RAG System",
    description:
      "An end-to-end RAG pipeline over Anthropic's API documentation — markdown-aware chunking into ~3,100 chunks, sentence-transformer embeddings, and a self-hosted Qdrant vector store, with full ingestion completing in under 60 seconds. Retrieval is exposed through a custom MCP server (built on the Python MCP SDK) with 4 tools, wired into an agent framework so the agent can only retrieve through MCP — no direct database access. The whole stack runs on a self-managed VPS behind Nginx/TLS with Docker, systemd, and a scripted GitHub Actions redeploy, with a Next.js frontend that includes a retrieval-inspector UI showing citation sources and similarity scores.",
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
    slug: "payment-processing-backend",
    name: "Real-Time Event-Driven Payment Processing Backend",
    description:
      "An event-driven payment backend using FastAPI and Apache Kafka to decouple synchronous API ingestion from asynchronous downstream processing, backed by a PostgreSQL state machine that tracks each payment through pending, processed, and failed states. Processing is idempotent — event IDs are tracked with conflict-safe inserts and Kafka offsets are committed manually, so a consumer crash can't cause duplicate charges or lost events. Failed events are routed to a dedicated dead-letter queue topic with structured error context, validated by load-testing with a producer simulating 1,000 payment requests.",
    tags: ["FastAPI", "Apache Kafka", "PostgreSQL", "Python"],
    githubUrl:
      "https://github.com/SriramV1212/Real-Time-Event-Driven-Payment-Processing-Backend",
  },
  {
    slug: "microservices-resilience-engine",
    name: "Distributed Microservices Orchestration & Resilience Engine",
    description:
      "A multi-service gRPC backend with a central orchestrator aggregating responses from separate User and Search services over protobuf-defined contracts, using server-side streaming for real-time result delivery. Circuit breakers and exponential backoff retries contain partial failures across services, and mutual TLS secures every cross-service call. Distributed tracing runs through OpenTelemetry gRPC interceptors capturing both function- and business-level spans, visualized in Jaeger, with Prometheus and Grafana for metrics — the observability stack runs via Docker Compose.",
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
  { category: "Programming Languages", items: ["Python", "SQL", "Linux"] },
  {
    category: "Backend & Data",
    items: [
      "FastAPI",
      "gRPC",
      "PostgreSQL",
      "MySQL",
      "MS SQL Server",
      "MongoDB",
      "Apache Kafka",
      "Apache Spark",
      "Redis",
    ],
  },
  {
    category: "Infrastructure & DevOps",
    items: [
      "Docker",
      "Kubernetes",
      "Airflow",
      "Nginx",
      "systemd",
      "AWS (S3, EC2, Lambda)",
      "Azure",
      "GitHub Actions",
      "Git",
    ],
  },
  { category: "Observability", items: ["Prometheus", "Grafana", "Jaeger"] },
  {
    category: "ML & AI",
    items: [
      "Pandas",
      "NumPy",
      "RAG",
      "LangChain",
      "Prompt Engineering",
      "Model Context Protocol (MCP)",
      "OpenClaw",
      "Hermes",
    ],
  },
  {
    category: "LLM Tooling & Vector DBs",
    items: ["LangSmith", "LlamaIndex", "LangGraph", "Pinecone", "ChromaDB", "Qdrant"],
  },
  {
    category: "AI-Assisted Development",
    items: ["Claude Code CLI", "Codex", "Cursor"],
  },
  { category: "Frontend", items: ["Next.js", "TypeScript", "Vercel"] },
];

// A skill's display label doesn't always match its tag on a project card
// verbatim (e.g. the full skill name includes a parenthetical abbreviation).
const skillTagAliases: Record<string, string> = {
  "Model Context Protocol (MCP)": "MCP",
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
      "Data Structures and Algorithms, Computer Networks, Programming Abstractions, Theory of Computation, Data Management, Big Data Systems, Big Data Analysis, Probability, Data Analysis, Statistical Learning, Statistical Computing",
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
