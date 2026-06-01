import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useState } from "react";
import {
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  GitBranch,
  LayoutGrid,
  MessageSquareText,
  Network,
  Plus,
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

const generatedQuestions = [
  "What is the real motivation behind this goal?",
  "Is the biggest constraint time, energy, money, skill, or support?",
  "What would you lose if nothing changes?",
  "Which decision keeps you stuck right now?",
];

const viewModes = [
  { label: "Graph", icon: Network },
  { label: "Kanban", icon: LayoutGrid },
  { label: "Timeline", icon: CalendarDays },
  { label: "Table", icon: Table2 },
  { label: "Pipeline", icon: GitBranch },
] as const;

type ViewMode = (typeof viewModes)[number]["label"];

type GraphState = {
  edges: Edge[];
  nodes: Node<GoalNodeData>[];
  onNodesChange: ReturnType<typeof useNodesState<Node<GoalNodeData>>>[2];
};

type PipelineFile = {
  id: string;
  name: string;
  description: string;
  status: string;
};

type WorkspaceProject = {
  id: string;
  name: string;
  files: PipelineFile[];
};

const initialProjects: WorkspaceProject[] = [
  {
    id: "app-factory",
    name: "App Factory",
    files: [
      {
        id: "public-launch",
        name: "Public launch map",
        description:
          "Turn a rough product idea into a credible public launch.",
        status: "Draft",
      },
      {
        id: "ai-intake",
        name: "AI intake questions",
        description: "Design the first follow-up question flow.",
        status: "Review",
      },
    ],
  },
  {
    id: "personal-systems",
    name: "Personal systems",
    files: [
      {
        id: "weekly-reset",
        name: "Weekly reset pipeline",
        description: "Make a lightweight weekly review and next-step map.",
        status: "Idea",
      },
    ],
  },
  {
    id: "open-source",
    name: "Open source support",
    files: [
      {
        id: "grant-readiness",
        name: "Grant readiness path",
        description: "Prepare the project story for open source support.",
        status: "Draft",
      },
    ],
  },
];

const planRows: [string, string, string, string][] = [
  ["Week 1", "Define the real constraint", "High", "Reflection"],
  ["Week 2", "Build the first visible proof", "High", "Action"],
  ["Week 3", "Review what changed", "Medium", "Checkpoint"],
  ["Week 4", "Commit to the next version", "High", "Decision"],
];

const kanbanColumns = [
  {
    title: "To clarify",
    items: ["Real constraint", "Launch audience", "Success signal"],
  },
  {
    title: "In progress",
    items: ["Workflow proof", "Public story"],
  },
  {
    title: "Review",
    items: ["Risk checkpoint", "Positioning decision"],
  },
  {
    title: "Ready",
    items: ["First release plan"],
  },
];

const timelineItems = [
  ["Day 1", "Reflect the real problem back to the user."],
  ["Day 3", "Create the first editable plan from the goal."],
  ["Week 1", "Validate the plan with one real launch scenario."],
  ["Week 2", "Publish the open source story and demo video."],
  ["Week 4", "Decide which nodes should become executable."],
];

const pipelineStages = [
  ["Intake", "Capture the messy goal and current context."],
  ["Questions", "Generate missing-context follow-ups."],
  ["Reflection", "Confirm the understood problem before planning."],
  ["Decompose", "Turn the goal into milestones and checkpoints."],
  ["Views", "Render the same plan as graph, kanban, timeline, or table."],
];

function renderPlanView(selectedView: ViewMode, graphState: GraphState) {
  if (selectedView === "Kanban") {
    return (
      <div className="plan-view kanban-board">
        {kanbanColumns.map((column) => (
          <section className="kanban-column" key={column.title}>
            <h3>{column.title}</h3>
            {column.items.map((item) => (
              <div className="kanban-item" key={item}>
                {item}
              </div>
            ))}
          </section>
        ))}
      </div>
    );
  }

  if (selectedView === "Timeline") {
    return (
      <div className="plan-view timeline-view">
        {timelineItems.map(([time, action]) => (
          <div className="timeline-item" key={`${time}-${action}`}>
            <span>{time}</span>
            <strong>{action}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (selectedView === "Table") {
    return (
      <div className="plan-view detail-table">
        <div className="detail-table-row detail-table-head">
          <span>When</span>
          <span>Action</span>
          <span>Priority</span>
          <span>Type</span>
        </div>
        {planRows.map(([time, action, priority, type]) => (
          <div className="detail-table-row" key={`${time}-${action}`}>
            <span>{time}</span>
            <strong>{action}</strong>
            <span>{priority}</span>
            <span>{type}</span>
          </div>
        ))}
      </div>
    );
  }

  if (selectedView === "Pipeline") {
    return (
      <div className="plan-view pipeline-view">
        {pipelineStages.map(([stage, description], index) => (
          <div className="pipeline-stage" key={stage}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{stage}</h3>
              <p>{description}</p>
            </div>
            {index < pipelineStages.length - 1 ? (
              <GitBranch className="pipeline-arrow" size={22} />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={graphState.nodes}
      edges={graphState.edges}
      fitView
      fitViewOptions={{ padding: 0.24 }}
      onNodesChange={graphState.onNodesChange}
      nodesDraggable
      nodesConnectable={false}
    >
      <Background gap={24} size={1} />
      <Controls />
    </ReactFlow>
  );
}

function App() {
  const [selectedView, setSelectedView] = useState<ViewMode>("Graph");
  const [nodes, , onNodesChange] = useNodesState<Node<GoalNodeData>>(goalNodes);
  const [edges] = useEdgesState(goalEdges);
  const [projects, setProjects] = useState(initialProjects);
  const [expandedProjectIds, setExpandedProjectIds] = useState(
    () => new Set(initialProjects.map((project) => project.id)),
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProjects[0].id,
  );
  const [selectedFileId, setSelectedFileId] = useState(
    initialProjects[0].files[0].id,
  );
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const selectedFile =
    selectedProject.files.find((file) => file.id === selectedFileId) ??
    selectedProject.files[0];

  function toggleProject(projectId: string) {
    setExpandedProjectIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }

  function createWorkspace() {
    const nextIndex = projects.length + 1;
    const projectId = `workspace-${nextIndex}`;
    const fileId = `${projectId}-first-goal`;
    const nextProject: WorkspaceProject = {
      id: projectId,
      name: `Workspace ${nextIndex}`,
      files: [
        {
          id: fileId,
          name: "First goal map",
          description: "Capture the first goal for this workspace.",
          status: "New",
        },
      ],
    };

    setProjects((current) => [...current, nextProject]);
    setExpandedProjectIds((current) => new Set(current).add(projectId));
    setSelectedProjectId(projectId);
    setSelectedFileId(fileId);
  }

  function createPipelineFile() {
    const nextFileId = `${selectedProject.id}-pipeline-${selectedProject.files.length + 1}`;
    const nextFile: PipelineFile = {
      id: nextFileId,
      name: `Goal pipeline ${selectedProject.files.length + 1}`,
      description: "New editable goal-to-pipeline file.",
      status: "New",
    };

    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? { ...project, files: [...project.files, nextFile] }
          : project,
      ),
    );
    setExpandedProjectIds((current) => new Set(current).add(selectedProject.id));
    setSelectedFileId(nextFileId);
  }

  return (
    <main className="app-shell">
      <aside className="left-rail">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">
              <GitBranch size={21} />
            </div>
            <div>
              <p>App Factory</p>
              <h1>Goal-to-Pipeline</h1>
            </div>
          </div>
          <div className="sidebar-actions">
            <button className="sidebar-action" type="button" onClick={createWorkspace}>
              <Plus size={15} />
              Workspace
            </button>
            <button className="sidebar-action" type="button" onClick={createPipelineFile}>
              <FileText size={15} />
              New pipeline
            </button>
          </div>
        </div>

        <nav className="project-browser" aria-label="Project folders">
          <div className="section-title">
            <Folder size={17} />
            <span>Project folders</span>
          </div>
          <div className="project-list">
            {projects.map((project) => {
              const isExpanded = expandedProjectIds.has(project.id);
              return (
                <div className="project-group" key={project.id}>
                  <button
                    className={
                      selectedProject.id === project.id
                        ? "project-row selected"
                        : "project-row"
                    }
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      toggleProject(project.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}
                    <Folder size={15} />
                    <span>{project.name}</span>
                    <em>{project.files.length}</em>
                  </button>
                  {isExpanded ? (
                    <div className="file-list">
                      {project.files.map((file) => (
                        <button
                          className={
                            selectedFile.id === file.id
                              ? "file-row selected"
                              : "file-row"
                          }
                          key={file.id}
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setSelectedFileId(file.id);
                          }}
                        >
                          <FileText size={14} />
                          <span>{file.name}</span>
                          <em>{file.status}</em>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>

        <section className="goal-card sidebar-current">
          <div className="section-title">
            <Target size={17} />
            <span>Selected pipeline</span>
          </div>
          <h2>{selectedFile.name}</h2>
          <p>{selectedFile.description}</p>
          <button
            className="primary-action"
            type="button"
            onClick={() => setQuestionsGenerated(true)}
          >
            <Sparkles size={17} />
            {questionsGenerated ? "Questions ready" : "Generate next questions"}
          </button>
        </section>
      </aside>

      <section className={showSettings ? "workspace settings-open" : "workspace"}>
        <header className="topbar">
          <div>
            <h2>{selectedFile.name}</h2>
            <p>
              {selectedProject.name} / {selectedFile.description}
            </p>
          </div>
          <button
            className="settings-button"
            type="button"
            aria-expanded={showSettings}
            aria-label="AI settings"
            onClick={() => setShowSettings((visible) => !visible)}
          >
            <Settings2 size={17} />
            AI key
          </button>
        </header>

        {showSettings ? (
          <div className="settings-strip" role="region" aria-label="AI key status">
            <strong>AI key not connected</strong>
            <span>Local preview mode is active until a provider key is saved.</span>
          </div>
        ) : null}

        <div className="view-switcher" aria-label="View mode">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = selectedView === mode.label;
            return (
              <button
                key={mode.label}
                aria-pressed={isActive}
                className={isActive ? "active" : undefined}
                onClick={() => setSelectedView(mode.label)}
                type="button"
              >
                <Icon size={16} />
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="flow-frame">
          {renderPlanView(selectedView, { edges, nodes, onNodesChange })}
        </div>

        <footer className="plan-table">
          <div className="table-heading">
            <Table2 size={17} />
            <span>{selectedView} preview</span>
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
            <span>{questionsGenerated ? "Generated follow-ups" : "Suggested follow-ups"}</span>
          </div>
          <ul>
            {(questionsGenerated
              ? generatedQuestions
              : generatedQuestions.slice(0, 2)
            ).map((question) => (
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
