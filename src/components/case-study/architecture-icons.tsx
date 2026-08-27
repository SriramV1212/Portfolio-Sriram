// Icon path fragments for TracedArchitectureDiagram, one per node type —
// deliberately multi-colored (unlike the rest of the site's restrained-
// emerald palette) to match specific reference images the payment and RAG
// write-ups' users provided; see CLAUDE.md. Each returns just the inner
// paths (no outer <svg>/stroke props) so the caller can nest them as a
// positioned <svg x y width height> inside the diagram's own SVG canvas.
import type { ArchIconKind } from "@/content/case-studies/types";

function MonitorIcon() {
  return (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </>
  );
}

function BracesIcon() {
  return (
    <>
      <path d="M9 4c-2 0-2.5 1-2.5 3v2c0 1.2-.5 2-2 2 1.5 0 2 .8 2 2v2c0 2 .5 3 2.5 3" />
      <path d="M15 4c2 0 2.5 1 2.5 3v2c0 1.2.5 2 2 2-1.5 0-2 .8-2 2v2c0 2-.5 3-2.5 3" />
      <path d="M12 11v2" />
    </>
  );
}

function DatabaseIcon() {
  return (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6.25c0 1.66 3.58 3 8 3s8-1.34 8-3V5.5" />
      <path d="M4 11.75V18c0 1.66 3.58 3 8 3s8-1.34 8-3v-6.25" />
    </>
  );
}

function KafkaIcon() {
  return (
    <>
      <circle cx="12" cy="5" r="2.25" />
      <circle cx="5" cy="18" r="2.25" />
      <circle cx="19" cy="18" r="2.25" />
      <path d="M10.7 6.9L6.3 16.1M13.3 6.9l4.4 9.2M7.3 18h9.4" />
    </>
  );
}

function GearIcon() {
  return (
    <>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 2.5v3M12 18.5v3M4 4l2.1 2.1M17.9 17.9L20 20M2.5 12h3M18.5 12h3M4 20l2.1-2.1M17.9 6.1L20 4" />
    </>
  );
}

function TrayIcon() {
  return (
    <>
      <path d="M3.5 12.5l2.5-7h12l2.5 7" />
      <path d="M3.5 12.5V18a1 1 0 001 1h15a1 1 0 001-1v-5.5" />
      <path d="M3.5 12.5h5l1.3 2h4.4l1.3-2h5" />
    </>
  );
}

function UserIcon() {
  return (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    </>
  );
}

function RobotIcon() {
  return (
    <>
      <rect x="5" y="9" width="14" height="10" rx="2.5" />
      <path d="M12 9V5.5" />
      <circle cx="12" cy="4" r="1.25" />
      <circle cx="9.25" cy="14" r="1.15" />
      <circle cx="14.75" cy="14" r="1.15" />
      <path d="M9 17.5h6" />
      <path d="M3 12.5h2M19 12.5h2" />
    </>
  );
}

function PlugIcon() {
  return (
    <>
      <path d="M9 3v5M15 3v5" />
      <path d="M7 8h10v3a5 5 0 01-10 0V8z" />
      <path d="M12 16v3" />
      <path d="M8.5 19h7" />
    </>
  );
}

const icons: Record<ArchIconKind, () => React.JSX.Element> = {
  monitor: MonitorIcon,
  braces: BracesIcon,
  database: DatabaseIcon,
  kafka: KafkaIcon,
  gear: GearIcon,
  tray: TrayIcon,
  user: UserIcon,
  robot: RobotIcon,
  plug: PlugIcon,
};

export default function ArchitectureIconPaths({ kind }: { kind: ArchIconKind }) {
  const Icon = icons[kind];
  return <Icon />;
}
