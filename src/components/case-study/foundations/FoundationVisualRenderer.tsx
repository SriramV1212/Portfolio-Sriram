import type { FoundationVisual, PrimitiveVisual } from "@/content/case-studies/types";
import PipelineFlow from "@/components/case-study/visuals/PipelineFlow";
import PointCluster from "@/components/case-study/visuals/PointCluster";
import MiniTable from "@/components/case-study/visuals/MiniTable";
import ClickableStateMachine from "@/components/case-study/visuals/ClickableStateMachine";
import Timeline from "@/components/case-study/visuals/Timeline";
import SideBySide from "@/components/case-study/visuals/SideBySide";

function renderPrimitive(visual: PrimitiveVisual) {
  switch (visual.kind) {
    case "pipeline":
      return (
        <PipelineFlow nodes={visual.nodes} edges={visual.edges} caption={visual.caption} />
      );
    case "cluster":
      return (
        <PointCluster
          points={visual.points}
          clusterColors={visual.clusterColors}
          caption={visual.caption}
        />
      );
    case "table":
      return (
        <MiniTable columns={visual.columns} states={visual.states} caption={visual.caption} />
      );
    case "state-machine":
      return (
        <ClickableStateMachine
          states={visual.states}
          transitions={visual.transitions}
          initialId={visual.initialId}
          viewBox={visual.viewBox}
        />
      );
    case "timeline":
      return (
        <Timeline
          segments={visual.segments}
          totalDuration={visual.totalDuration}
          unit={visual.unit}
          caption={visual.caption}
        />
      );
  }
}

export default function FoundationVisualRenderer({ visual }: { visual: FoundationVisual }) {
  if (visual.kind === "side-by-side") {
    return (
      <SideBySide
        left={{ label: visual.leftLabel, children: renderPrimitive(visual.left) }}
        right={{ label: visual.rightLabel, children: renderPrimitive(visual.right) }}
        caption={visual.caption}
      />
    );
  }
  return renderPrimitive(visual);
}
