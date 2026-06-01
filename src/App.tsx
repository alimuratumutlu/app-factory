import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  GitBranch,
  LayoutGrid,
  MessageSquareText,
  Network,
  Settings2,
  Sparkles,
  Table2,
  Target,
} from "lucide-react";
import "./App.css";

type GoalNodeData = {
  label: string;
  kind: string;
  description: string;
};

const goalNodes: Node<GoalNodeData>[] = [
  {
    id: "intake",
    position: { x: 0, y: 120 },
    data: {
      label: "Goal intake",
      kind: "context",
      description: "Current state, constraints, resources, and target outcome.",
    },
  },
  {
    id: "questions",
    position: { x: 130, y: 40 },
    data: {
      label: "Questions",
      kind: "ai",
      description: "AI-generated follow-ups that find missing context.",
    },
  },
  {
    id: "reflection",
    position: { x: 260, y: 40 },
    data: {
      label: "Reflection",
      kind: "ai",
      description: "The AI summarizes what it thinks the real bottleneck is.",
    },
  },
  {
    id: "milestones",
    position: { x: 410, y: 0 },
    data: {
      label: "Milestones",
      kind: "plan",
      description: "Small outcomes that make the larger goal measurable.",
    },
  },
  {
    id: "actions",
    position: { x: 410, y: 190 },
    data: {
      label: "Actions",
      kind: "plan",
      description: "Concrete steps for the first week and first month.",
    },
  },
  {
    id: "checkpoints",
    position: { x: 540, y: 95 },
    data: {
      label: "Checkpoints",
      kind: "review",
      description: "Decision gates, risks, and review moments.",
    },
  },
  {
    id: "views",
    position: { x: 670, y: 95 },
    data: {
      label: "Views",
      kind: "output",
      description: "Kanban, timeline, graph, table, or pipeline preview.",
    },
  },
];

const goalEdges: Edge[] = [
  { id: "intake-questions", source: "intake", target: "questions" },
  { id: "questions-reflection", source: "questions", target: "reflection" },
  { id: "reflection-milestones", source: "reflection", target: "milestones" },
  { id: "reflection-actions", source: "reflection", target: "actions" },
  { id: "milestones-checkpoints", source: "milestones", target: "checkpoints" },
  { id: "actions-checkpoints", source: "actions", target: "checkpoints" },
  { id: "checkpoints-views", source: "checkpoints", target: "views" },
  {
    id: "checkpoints-reflection",
    source: "checkpoints",
    target: "reflection",
    animated: true,
    label: "revise",
  },
];

const baseQuestions = [
  "What do you want to change?",
  "Where are you right now?",
  "What resources do you already have?",
  "How much time can you commit?",
  "What would success look like in 30 days?",
];

const generatedQuestions = [
  "What is the real motivation behind this goal?",
  "Is the biggest constraint time, energy, money, skill, or support?",
  "What would you lose if nothing changes?",
  "Which decision keeps you stuck right now?",
];

const viewModes = [
  { label: "Graph", icon: Network, active: true },
  { label: "Kanban", icon: LayoutGrid, active: false },
  { label: "Timeline", icon: CalendarDays, active: false },
  { label: "Table", icon: Table2, active: false },
  { label: "Pipeline", icon: GitBranch, active: false },
];

const planRows = [
  ["Week 1", "Define the real constraint", "High", "Reflection"],
  ["Week 2", "Build the first visible proof", "High", "Action"],
  ["Week 3", "Review what changed", "Medium", "Checkpoint"],
  ["Week 4", "Commit to the next version", "High", "Decision"],
];

function App() {
  return (
    <main className="app-shell">
      <aside className="left-rail">
        <div className="brand">
          <div className="brand-mark">
            <GitBranch size={21} />
          </div>
          <div>
            <p>App Factory</p>
            <h1>Goal-to-Pipeline</h1>
          </div>
        </div>

        <section className="goal-card">
          <div className="section-title">
            <Target size={17} />
            <span>Current goal</span>
          </div>
          <h2>Turn a rough product idea into a credible public launch.</h2>
          <p>
            Available assets: signed macOS app, GitHub repo, first release, and
            a clear open source direction.
          </p>
          <button className="primary-action" type="button">
            <Sparkles size={17} />
            Generate next questions
          </button>
        </section>

        <section className="question-panel">
          <div className="section-title">
            <CircleHelp size={17} />
            <span>Base questions</span>
          </div>
          <ul>
            {baseQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h2>Turn messy goals into structured action maps.</h2>
            <p>
              The plan is previewed as graph, kanban, timeline, table, or
              pipeline before anything becomes executable.
            </p>
          </div>
          <button className="settings-button" type="button" aria-label="AI settings">
            <Settings2 size={17} />
            AI key
          </button>
        </header>

        <div className="view-switcher" aria-label="View mode">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.label}
                className={mode.active ? "active" : undefined}
                type="button"
              >
                <Icon size={16} />
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="flow-frame">
          <ReactFlow
            nodes={goalNodes}
            edges={goalEdges}
            fitView
            fitViewOptions={{ padding: 0.24 }}
            nodesDraggable
            nodesConnectable={false}
          >
            <Background gap={24} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        <footer className="plan-table">
          <div className="table-heading">
            <Table2 size={17} />
            <span>30-day preview</span>
          </div>
          <div className="table-grid">
            {planRows.map(([time, action, priority, type]) => (
              <div className="table-row" key={`${time}-${action}`}>
                <span>{time}</span>
                <strong>{action}</strong>
                <span>{priority}</span>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </footer>
      </section>

      <aside className="right-rail">
        <section className="reflection-card">
          <div className="section-title">
            <BrainCircuit size={17} />
            <span>AI reflection</span>
          </div>
          <h2>Understood problem</h2>
          <p>
            The main bottleneck is not the app scaffold. It is proving a
            concrete workflow that users can trust, then turning that proof into
            a launch story.
          </p>
        </section>

        <section className="question-panel generated">
          <div className="section-title">
            <MessageSquareText size={17} />
            <span>Generated follow-ups</span>
          </div>
          <ul>
            {generatedQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>

        <section className="checkpoint-card">
          <div className="section-title">
            <CheckCircle2 size={17} />
            <span>Checkpoint</span>
          </div>
          <p>
            Do not publish this as an autonomous runner until at least one real
            user goal can become an editable plan with visible review points.
          </p>
        </section>
      </aside>
    </main>
  );
}

export default App;
