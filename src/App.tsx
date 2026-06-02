import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  FileText,
  Folder,
  GraduationCap,
  GitBranch,
  HeartPulse,
  KeyRound,
  LayoutGrid,
  MessageSquareText,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Settings2,
  ShieldCheck,
  Table2,
  UserRound,
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

const intakeTemplates: IntakeTemplate[] = [
  {
    id: "career",
    label: "Better career",
    description: "Role, income, confidence, direction",
    prompt: "I want to build a better career but I am not sure what to focus on first.",
  },
  {
    id: "weight-loss",
    label: "Lose weight",
    description: "Health, routine, food, accountability",
    prompt: "I want to lose weight in a sustainable way without burning out.",
  },
  {
    id: "muscle",
    label: "Build muscle",
    description: "Training, nutrition, recovery, consistency",
    prompt: "I want to gain muscle and create a realistic training routine.",
  },
  {
    id: "education",
    label: "Learn better",
    description: "Study plan, skill gaps, exams, habits",
    prompt: "I want to improve my education or learn a difficult skill with a clear plan.",
  },
  {
    id: "family",
    label: "Family balance",
    description: "Time, communication, pressure, decisions",
    prompt: "I want to improve something in my family life and make better decisions.",
  },
];

const defaultQuestionSet: QuestionSet = {
  summary:
    "You want to turn a messy situation into a concrete direction without jumping to a shallow checklist.",
  bottleneck:
    "The first bottleneck is likely unclear context: what matters most, what is constrained, and what would count as progress.",
  questions: generatedQuestions,
};

const openAiModelOptions: ModelOption[] = [
  { label: "GPT-5.5", value: "gpt-5.5" },
  { label: "GPT-5.4", value: "gpt-5.4" },
  { label: "GPT-5.4 mini", value: "gpt-5.4-mini" },
  { label: "GPT-5.4 nano", value: "gpt-5.4-nano" },
  { label: "Custom OpenAI model", value: "custom-openai" },
];

const claudeModelOptions: ModelOption[] = [
  { label: "Claude Opus 4.8", value: "claude-opus-4-8" },
  { label: "Claude Sonnet 4.6", value: "claude-sonnet-4-6" },
  { label: "Claude Haiku 4.5", value: "claude-haiku-4-5-20251001" },
  { label: "Custom Claude model", value: "custom-claude" },
];

const openRouterModelOptions: ModelOption[] = [
  { label: "OpenAI GPT-5.5 via OpenRouter", value: "openai/gpt-5.5" },
  { label: "OpenAI GPT-5.4 via OpenRouter", value: "openai/gpt-5.4" },
  { label: "OpenAI GPT-5.4 mini via OpenRouter", value: "openai/gpt-5.4-mini" },
  { label: "OpenAI GPT-5.4 nano via OpenRouter", value: "openai/gpt-5.4-nano" },
  { label: "Anthropic Claude Opus 4.8 via OpenRouter", value: "anthropic/claude-opus-4.8" },
  { label: "Anthropic Claude Sonnet 4.6 via OpenRouter", value: "anthropic/claude-sonnet-4.6" },
  { label: "Anthropic Claude Haiku 4.5 via OpenRouter", value: "anthropic/claude-haiku-4.5" },
  { label: "Google Gemini 3 Pro via OpenRouter", value: "google/gemini-3-pro" },
  { label: "DeepSeek V3.2 via OpenRouter", value: "deepseek/deepseek-v3.2" },
  { label: "OpenRouter auto", value: "openrouter/auto" },
];

function getStoredModel(storageKey: string, options: ModelOption[]) {
  const storedModel = window.localStorage.getItem(storageKey);
  if (storedModel && options.some((option) => option.value === storedModel)) {
    return storedModel;
  }

  return options[0].value;
}

const viewModes = [
  { label: "Pipeline", icon: GitBranch },
  { label: "Kanban", icon: LayoutGrid },
  { label: "Timeline", icon: CalendarDays },
  { label: "Table", icon: Table2 },
  { label: "Graph", icon: Network },
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

type IntakeTemplate = {
  description: string;
  id: string;
  label: string;
  prompt: string;
};

type QuestionSet = {
  bottleneck: string;
  questions: string[];
  summary: string;
};

type ModelOption = {
  label: string;
  value: string;
};

type ModelDropdownProps = {
  id: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: ModelOption[];
  value: string;
};

type KnowledgeGraphNode = SimulationNodeDatum & {
  id: string;
  label: string;
  level: number;
  cluster: string;
};

type KnowledgeGraphLink = SimulationLinkDatum<KnowledgeGraphNode> & {
  id: string;
  source: string | KnowledgeGraphNode;
  target: string | KnowledgeGraphNode;
};

const initialProjects: WorkspaceProject[] = [
  {
    id: "solution-factory",
    name: "Solution Factory",
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

function createFallbackQuestionSet(goal: string, templateLabel?: string) {
  const focus = templateLabel ? `${templateLabel}: ${goal}` : goal;

  return {
    summary: `You want to work on "${focus}" and turn it into a plan that is specific enough to act on.`,
    bottleneck:
      "The useful next step is not advice yet. The useful next step is learning what is really blocking progress.",
    questions: [
      "What has already failed or felt unsustainable before?",
      "What is the biggest constraint right now: time, energy, money, skill, support, or clarity?",
      "What would a small but real improvement look like in the next 7 days?",
      "What would make this goal emotionally worth the effort?",
    ],
  };
}

function parseQuestionSet(content: string, fallback: QuestionSet) {
  try {
    const normalizedContent = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
    const parsed = JSON.parse(normalizedContent) as Partial<QuestionSet>;
    if (
      typeof parsed.summary === "string" &&
      typeof parsed.bottleneck === "string" &&
      Array.isArray(parsed.questions)
    ) {
      return {
        summary: parsed.summary,
        bottleneck: parsed.bottleneck,
        questions: parsed.questions
          .filter((question): question is string => typeof question === "string")
          .slice(0, 6),
      };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

async function requestOpenRouterQuestionSet({
  apiKey,
  goal,
  model,
  templateLabel,
}: {
  apiKey: string;
  goal: string;
  model: string;
  templateLabel?: string;
}) {
  const fallback = createFallbackQuestionSet(goal, templateLabel);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Solution Factory",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a careful goal decomposition assistant. Do not solve yet. Reflect the user's problem and ask personalizing follow-up questions. Return only strict JSON with keys summary, bottleneck, questions.",
        },
        {
          role: "user",
          content: JSON.stringify({
            goal,
            template: templateLabel ?? "custom",
            output:
              "Return a JSON object. questions must be 4 to 6 short questions that help personalize a future goal-to-pipeline plan.",
          }),
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  return typeof content === "string" ? parseQuestionSet(content, fallback) : fallback;
}

function truncateLabel(label: string) {
  return label.length > 22 ? `${label.slice(0, 19)}...` : label;
}

function createKnowledgeGraph(
  selectedProject: WorkspaceProject,
  selectedFile: PipelineFile,
) {
  const nodes: KnowledgeGraphNode[] = [
    {
      id: "current",
      label: selectedFile.name,
      level: 3,
      cluster: "current",
      fx: 420,
      fy: 210,
    },
    {
      id: "workspace",
      label: selectedProject.name,
      level: 2,
      cluster: "workspace",
    },
    {
      id: "intake",
      label: "Intake",
      level: 2,
      cluster: "context",
    },
    {
      id: "questions",
      label: "Questions",
      level: 2,
      cluster: "context",
    },
    {
      id: "reflection",
      label: "Reflection",
      level: 2,
      cluster: "thinking",
    },
    {
      id: "milestones",
      label: "Milestones",
      level: 2,
      cluster: "plan",
    },
    {
      id: "actions",
      label: "Actions",
      level: 2,
      cluster: "plan",
    },
    {
      id: "review",
      label: "Review loop",
      level: 2,
      cluster: "review",
    },
  ];

  const links: KnowledgeGraphLink[] = [
    { id: "workspace-current", source: "workspace", target: "current" },
    { id: "current-intake", source: "current", target: "intake" },
    { id: "intake-questions", source: "intake", target: "questions" },
    { id: "questions-reflection", source: "questions", target: "reflection" },
    { id: "reflection-milestones", source: "reflection", target: "milestones" },
    { id: "reflection-actions", source: "reflection", target: "actions" },
    { id: "actions-review", source: "actions", target: "review" },
    { id: "review-reflection", source: "review", target: "reflection" },
  ];

  selectedProject.files.slice(0, 8).forEach((file, index) => {
    const id = `file-${file.id}`;
    nodes.push({
      id,
      label: file.name,
      level: file.id === selectedFile.id ? 2 : 1,
      cluster: "workspace",
    });
    links.push({
      id: `workspace-${id}-${index}`,
      source: "workspace",
      target: id,
    });
  });

  generatedQuestions.forEach((question, index) => {
    const id = `question-${index}`;
    nodes.push({ id, label: question, level: 1, cluster: "questions" });
    links.push({ id: `questions-${id}`, source: "questions", target: id });
  });

  planRows.forEach(([time, action, priority], index) => {
    const id = `action-${index}`;
    nodes.push({
      id,
      label: `${time}: ${action}`,
      level: priority === "High" ? 1 : 0,
      cluster: "actions",
    });
    links.push({ id: `actions-${id}`, source: "actions", target: id });
  });

  ["Scope creep", "Wrong audience", "No weekly review", "Unclear proof"].forEach(
    (risk, index) => {
      const id = `risk-${index}`;
      nodes.push({ id, label: risk, level: 0, cluster: "review" });
      links.push({ id: `review-${id}`, source: "review", target: id });
    },
  );

  return { links, nodes };
}

function ForceGraphView({
  selectedFile,
  selectedProject,
}: {
  selectedFile: PipelineFile;
  selectedProject: WorkspaceProject;
}) {
  const graph = useMemo(
    () => createKnowledgeGraph(selectedProject, selectedFile),
    [selectedFile.id, selectedProject.id, selectedProject.files.length],
  );
  const [layout, setLayout] = useState(graph);

  useEffect(() => {
    const nodes = graph.nodes.map((node, index) => ({
      ...node,
      x: node.fx ?? 420 + Math.cos(index) * 80,
      y: node.fy ?? 210 + Math.sin(index) * 80,
    }));
    const links = graph.links.map((link) => ({ ...link }));
    let tickCount = 0;
    let animationFrame = 0;
    const simulation = forceSimulation<KnowledgeGraphNode>(nodes)
      .force(
        "link",
        forceLink<KnowledgeGraphNode, KnowledgeGraphLink>(links)
          .id((node) => node.id)
          .distance((link) => {
            const sourceId =
              typeof link.source === "string" ? link.source : link.source.id;
            const targetId =
              typeof link.target === "string" ? link.target : link.target.id;
            return sourceId === "current" || targetId === "current" ? 118 : 86;
          })
          .strength(0.55),
      )
      .force(
        "charge",
        forceManyBody<KnowledgeGraphNode>().strength((node) =>
          node.level >= 3 ? -720 : node.level === 2 ? -260 : -72,
        ),
      )
      .force(
        "collide",
        forceCollide<KnowledgeGraphNode>().radius((node) =>
          node.level >= 3 ? 42 : node.level === 2 ? 31 : 17,
        ),
      )
      .force(
        "radial",
        forceRadial<KnowledgeGraphNode>(
          (node) => (node.level >= 3 ? 0 : node.level === 2 ? 132 : 235),
          420,
          210,
        ).strength(0.22),
      )
      .force("x", forceX<KnowledgeGraphNode>(420).strength(0.025))
      .force("y", forceY<KnowledgeGraphNode>(210).strength(0.025))
      .force("center", forceCenter<KnowledgeGraphNode>(420, 210))
      .alpha(1)
      .alphaDecay(0.018);

    function animate() {
      simulation.tick();
      tickCount += 1;
      setLayout({
        links: [...links],
        nodes: nodes.map((node) => ({ ...node })),
      });

      if (tickCount < 260 && simulation.alpha() > 0.015) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      simulation.stop();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [graph]);

  return (
    <div className="force-graph-view" aria-label="Graph preview">
      <svg viewBox="0 0 840 420" role="img">
        <g>
          {layout.links.map((link) => {
            const source =
              typeof link.source === "string" ? undefined : link.source;
            const target =
              typeof link.target === "string" ? undefined : link.target;

            if (!source || !target) {
              return null;
            }

            return (
              <line
                className="force-link"
                key={link.id}
                x1={source.x}
                x2={target.x}
                y1={source.y}
                y2={target.y}
              />
            );
          })}
        </g>
        <g>
          {layout.nodes.map((node) => (
            <g
              className={`force-node force-node-level-${node.level}`}
              key={node.id}
              transform={`translate(${node.x ?? 0} ${node.y ?? 0})`}
            >
              <circle r={node.level >= 3 ? 9 : node.level === 2 ? 6 : 3.2} />
              {node.level > 0 ? (
                <text dy={node.level >= 3 ? 24 : 20}>
                  {truncateLabel(node.label)}
                </text>
              ) : null}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function renderPlanView(
  selectedView: ViewMode,
  graphState: GraphState,
  selectedProject: WorkspaceProject,
  selectedFile: PipelineFile,
) {
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

  if (selectedView === "Graph") {
    return (
      <ForceGraphView
        selectedFile={selectedFile}
        selectedProject={selectedProject}
      />
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

function ModelDropdown({
  id,
  isOpen,
  onChange,
  onOpenChange,
  options,
  value,
}: ModelDropdownProps) {
  const selectedModel =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="model-dropdown" onClick={(event) => event.stopPropagation()}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="model-dropdown-button"
        onClick={() => onOpenChange(!isOpen)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onOpenChange(false);
          }
        }}
        type="button"
      >
        <span className="model-dropdown-value">{selectedModel.label}</span>
        <ChevronDown size={17} />
      </button>
      {isOpen ? (
        <div className="model-dropdown-menu" role="listbox" aria-label={id}>
          {options.map((model) => {
            const isSelected = model.value === selectedModel.value;

            return (
              <button
                aria-selected={isSelected}
                className={isSelected ? "model-dropdown-option selected" : "model-dropdown-option"}
                key={model.value}
                onClick={() => {
                  onChange(model.value);
                  onOpenChange(false);
                }}
                role="option"
                type="button"
              >
                <span className="model-dropdown-option-label">{model.label}</span>
                <span className="model-dropdown-option-id">{model.value}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function App() {
  const [selectedView, setSelectedView] = useState<ViewMode>("Pipeline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [openModelDropdown, setOpenModelDropdown] = useState<string | null>(null);
  const [openAiKey, setOpenAiKey] = useState(
    () => window.localStorage.getItem("solution-factory.openai-key") ?? "",
  );
  const [openAiModel, setOpenAiModel] = useState(
    () => getStoredModel("solution-factory.openai-model", openAiModelOptions),
  );
  const [claudeKey, setClaudeKey] = useState(
    () => window.localStorage.getItem("solution-factory.claude-key") ?? "",
  );
  const [claudeModel, setClaudeModel] = useState(
    () => getStoredModel("solution-factory.claude-model", claudeModelOptions),
  );
  const [openRouterKey, setOpenRouterKey] = useState(
    () => window.localStorage.getItem("solution-factory.openrouter-key") ?? "",
  );
  const [openRouterModel, setOpenRouterModel] = useState(
    () =>
      getStoredModel("solution-factory.openrouter-model", openRouterModelOptions),
  );
  const [intakeText, setIntakeText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [questionSet, setQuestionSet] = useState<QuestionSet>(defaultQuestionSet);
  const [aiStatus, setAiStatus] = useState<"idle" | "local" | "live" | "error">(
    "idle",
  );
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const selectedFile =
    selectedProject.files.find((file) => file.id === selectedFileId) ??
    selectedProject.files[0] ??
    null;
  const selectedTemplate = intakeTemplates.find(
    (template) => template.id === selectedTemplateId,
  );
  const hasAnyAiKey = Boolean(
    openAiKey.trim() || claudeKey.trim() || openRouterKey.trim(),
  );

  useEffect(() => {
    function closeFloatingMenus() {
      setOpenModelDropdown(null);
    }

    window.addEventListener("click", closeFloatingMenus);
    return () => window.removeEventListener("click", closeFloatingMenus);
  }, []);

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
    const nextProject: WorkspaceProject = {
      id: projectId,
      name: `Workspace ${nextIndex}`,
      files: [],
    };

    setProjects((current) => [...current, nextProject]);
    setExpandedProjectIds((current) => new Set(current).add(projectId));
    setSelectedProjectId(projectId);
    setSelectedFileId("");
    setIntakeText("");
    setSelectedTemplateId(null);
    setAiStatus("idle");
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

  function deriveGoalTitle(goal: string, template?: IntakeTemplate) {
    if (template) {
      return template.label;
    }

    const compactGoal = goal.trim().replace(/\s+/g, " ");
    if (!compactGoal) {
      return "New goal map";
    }

    return compactGoal.length > 34 ? `${compactGoal.slice(0, 31)}...` : compactGoal;
  }

  function saveAiSettings() {
    window.localStorage.setItem("solution-factory.openai-key", openAiKey);
    window.localStorage.setItem("solution-factory.openai-model", openAiModel);
    window.localStorage.setItem("solution-factory.claude-key", claudeKey);
    window.localStorage.setItem("solution-factory.claude-model", claudeModel);
    window.localStorage.setItem("solution-factory.openrouter-key", openRouterKey);
    window.localStorage.setItem("solution-factory.openrouter-model", openRouterModel);
  }

  async function beginGoalPipeline() {
    const goal = intakeText.trim() || selectedTemplate?.prompt || "";
    if (!goal || isGeneratingPlan) {
      return;
    }

    const fileId = `${selectedProject.id}-goal-${Date.now()}`;
    const nextFile: PipelineFile = {
      id: fileId,
      name: deriveGoalTitle(goal, selectedTemplate),
      description: goal,
      status: "Intake",
    };
    const fallback = createFallbackQuestionSet(goal, selectedTemplate?.label);

    setIsGeneratingPlan(true);
    setQuestionSet(fallback);
    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? { ...project, files: [...project.files, nextFile] }
          : project,
      ),
    );
    setExpandedProjectIds((current) => new Set(current).add(selectedProject.id));
    setSelectedFileId(fileId);

    try {
      if (!openRouterKey.trim()) {
        setAiStatus("local");
        return;
      }

      const liveQuestionSet = await requestOpenRouterQuestionSet({
        apiKey: openRouterKey.trim(),
        goal,
        model: openRouterModel.trim() || openRouterModelOptions[0].value,
        templateLabel: selectedTemplate?.label,
      });
      setQuestionSet(liveQuestionSet);
      setAiStatus("live");
    } catch {
      setQuestionSet(fallback);
      setAiStatus("error");
    } finally {
      setIsGeneratingPlan(false);
    }
  }

  return (
    <main className={sidebarCollapsed ? "app-shell sidebar-collapsed" : "app-shell"}>
      <aside className="left-rail">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">
              <GitBranch size={21} />
            </div>
            <div className="brand-copy">
              <p>Solution Factory</p>
              <h1>Goal-to-Pipeline</h1>
            </div>
            <button
              className="sidebar-toggle"
              type="button"
              aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
              aria-expanded={!sidebarCollapsed}
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              title={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={17} />
              ) : (
                <PanelLeftClose size={17} />
              )}
            </button>
          </div>
          <div className="sidebar-actions sidebar-collapsible">
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

        <nav className="project-browser sidebar-collapsible" aria-label="Project folders">
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
                    aria-expanded={isExpanded}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      if (!project.files.some((file) => file.id === selectedFileId)) {
                        setSelectedFileId(project.files[0]?.id ?? "");
                      }
                      toggleProject(project.id);
                    }}
                  >
                    <ChevronRight
                      className={isExpanded ? "project-chevron expanded" : "project-chevron"}
                      size={15}
                    />
                    <Folder size={15} />
                    <span>{project.name}</span>
                    <em>{project.files.length}</em>
                  </button>
                  <div
                    className={isExpanded ? "file-list expanded" : "file-list"}
                    aria-hidden={!isExpanded}
                    style={
                      {
                        "--file-count": project.files.length,
                      } as CSSProperties
                    }
                  >
                    {project.files.map((file) => (
                      <button
                        className={
                          selectedFile?.id === file.id
                            ? "file-row selected"
                            : "file-row"
                        }
                        disabled={!isExpanded}
                        key={file.id}
                        tabIndex={isExpanded ? 0 : -1}
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
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      <section
        className={[
          "workspace",
          showSettings ? "settings-open" : "",
          selectedFile ? "" : "empty-workspace",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <header className="topbar">
          <div>
            <h2>
              {showSettings
                ? "AI providers"
                : selectedFile
                  ? selectedFile.name
                  : "Describe the problem you want to solve"}
            </h2>
            <p>
              {showSettings
                ? "Add model providers, save local API keys, and choose default models for personalized goal planning."
                : selectedFile
                  ? `${selectedProject.name} / ${selectedFile.description}`
                  : `${selectedProject.name} is empty. Start with a few words or choose a template.`}
            </p>
          </div>
          <div className="account-menu-shell">
            <button
              className="account-button"
              type="button"
              aria-expanded={showAccountMenu}
              aria-label="Open account and settings menu"
              onClick={() => setShowAccountMenu((visible) => !visible)}
            >
              <span className="profile-avatar" aria-hidden="true">MU</span>
              <span className="account-button-copy">
                <strong>Local profile</strong>
                <span>{hasAnyAiKey ? "AI connected" : "AI not connected"}</span>
              </span>
              <ChevronRight
                className={showAccountMenu ? "account-chevron expanded" : "account-chevron"}
                size={16}
              />
            </button>

            {showAccountMenu ? (
              <div className="account-menu" role="menu">
                <div className="account-menu-header">
                  <span className="profile-avatar large" aria-hidden="true">MU</span>
                  <div>
                    <strong>Murat Umutlu</strong>
                    <span>Local workspace account</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowSettings(true);
                    setShowAccountMenu(false);
                  }}
                >
                  <KeyRound size={16} />
                  <span>
                    <strong>AI provider</strong>
                    <em>OpenAI, Claude, OpenRouter</em>
                  </span>
                </button>
                <button type="button" role="menuitem">
                  <Settings2 size={16} />
                  <span>
                    <strong>Preferences</strong>
                    <em>Language, defaults, templates</em>
                  </span>
                </button>
                <button type="button" role="menuitem">
                  <ShieldCheck size={16} />
                  <span>
                    <strong>Privacy and data</strong>
                    <em>Local-first storage controls</em>
                  </span>
                </button>
                <button type="button" role="menuitem">
                  <UserRound size={16} />
                  <span>
                    <strong>Account</strong>
                    <em>Profile image and identity</em>
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {!showSettings && selectedFile ? (
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
        ) : null}

        <div className="flow-frame">
          {showSettings ? (
            <section className="provider-settings-page" aria-label="AI provider settings">
              <div className="provider-settings-header">
                <div>
                  <div className="intake-kicker">Model providers</div>
                  <h3>Connect the models that will ask better questions.</h3>
                  <p>
                    Keys are saved locally on this device. OpenRouter is used by
                    the current question generation flow; OpenAI and Claude
                    direct adapters are prepared here for the next runtime step.
                  </p>
                </div>
                <div className="provider-actions">
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => setShowSettings(false)}
                  >
                    Back
                  </button>
                  <button className="settings-save" type="button" onClick={saveAiSettings}>
                    Save providers
                  </button>
                </div>
              </div>

              <div className="provider-card-list">
                <section className="provider-card primary-provider">
                  <div className="provider-card-top">
                    <div className="provider-logo openai-logo">
                      <BrainCircuit size={19} />
                    </div>
                    <div>
                      <h4>OpenAI</h4>
                      <p>Planning, reflection, and structured follow-up questions.</p>
                    </div>
                    <span className={openAiKey.trim() ? "provider-status ready" : "provider-status"}>
                      {openAiKey.trim() ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="provider-form-grid">
                    <label className="provider-field">
                      <span>API key</span>
                      <input
                        type="password"
                        value={openAiKey}
                        placeholder="sk-..."
                        onChange={(event) => setOpenAiKey(event.target.value)}
                      />
                    </label>
                    <div className="provider-field">
                      <span>Default model</span>
                      <ModelDropdown
                        id="OpenAI default model"
                        isOpen={openModelDropdown === "openai"}
                        onChange={setOpenAiModel}
                        onOpenChange={(isOpen) =>
                          setOpenModelDropdown(isOpen ? "openai" : null)
                        }
                        options={openAiModelOptions}
                        value={openAiModel}
                      />
                    </div>
                  </div>
                </section>

                <section className="provider-card">
                  <div className="provider-card-top">
                    <div className="provider-logo claude-logo">
                      <MessageSquareText size={19} />
                    </div>
                    <div>
                      <h4>Claude</h4>
                      <p>Long-context coaching, careful critique, and nuanced review.</p>
                    </div>
                    <span className={claudeKey.trim() ? "provider-status ready" : "provider-status"}>
                      {claudeKey.trim() ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="provider-form-grid">
                    <label className="provider-field">
                      <span>API key</span>
                      <input
                        type="password"
                        value={claudeKey}
                        placeholder="sk-ant-..."
                        onChange={(event) => setClaudeKey(event.target.value)}
                      />
                    </label>
                    <div className="provider-field">
                      <span>Default model</span>
                      <ModelDropdown
                        id="Claude default model"
                        isOpen={openModelDropdown === "claude"}
                        onChange={setClaudeModel}
                        onOpenChange={(isOpen) =>
                          setOpenModelDropdown(isOpen ? "claude" : null)
                        }
                        options={claudeModelOptions}
                        value={claudeModel}
                      />
                    </div>
                  </div>
                </section>

                <section className="provider-card">
                  <div className="provider-card-top">
                    <div className="provider-logo openrouter-logo">
                      <Network size={19} />
                    </div>
                    <div>
                      <h4>OpenRouter</h4>
                      <p>Current live provider for generated reflection questions.</p>
                    </div>
                    <span className={openRouterKey.trim() ? "provider-status ready" : "provider-status"}>
                      {openRouterKey.trim() ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="provider-form-grid">
                    <label className="provider-field">
                      <span>API key</span>
                      <input
                        type="password"
                        value={openRouterKey}
                        placeholder="sk-or-v1..."
                        onChange={(event) => setOpenRouterKey(event.target.value)}
                      />
                    </label>
                    <div className="provider-field">
                      <span>Default model</span>
                      <ModelDropdown
                        id="OpenRouter default model"
                        isOpen={openModelDropdown === "openrouter"}
                        onChange={setOpenRouterModel}
                        onOpenChange={(isOpen) =>
                          setOpenModelDropdown(isOpen ? "openrouter" : null)
                        }
                        options={openRouterModelOptions}
                        value={openRouterModel}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </section>
          ) : selectedFile ? (
            renderPlanView(
              selectedView,
              { edges, nodes, onNodesChange },
              selectedProject,
              selectedFile,
            )
          ) : (
            <section className="intake-stage" aria-label="Goal intake">
              <div className="intake-panel">
                <div className="intake-kicker">Design your next move</div>
                <h3>What do you want to make better?</h3>
                <p>
                  Start messy. A goal, a frustration, a decision, or a life
                  situation is enough. The app will reflect the problem first,
                  then ask better follow-up questions.
                </p>
                <textarea
                  value={intakeText}
                  placeholder="For example: I feel stuck in my career and do not know what to improve first."
                  onChange={(event) => setIntakeText(event.target.value)}
                />
                <div className="template-grid" aria-label="Goal templates">
                  {intakeTemplates.map((template) => {
                    const templateIcons = {
                      career: BriefcaseBusiness,
                      education: GraduationCap,
                      family: HeartPulse,
                      muscle: Dumbbell,
                      "weight-loss": HeartPulse,
                    };
                    const TemplateIcon = templateIcons[template.id as keyof typeof templateIcons];
                    const isSelected = selectedTemplateId === template.id;

                    return (
                      <button
                        className={isSelected ? "template-chip selected" : "template-chip"}
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setIntakeText(template.prompt);
                        }}
                      >
                        <TemplateIcon size={16} />
                        <strong>{template.label}</strong>
                        <span>{template.description}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  className="intake-submit"
                  type="button"
                  disabled={isGeneratingPlan || !(intakeText.trim() || selectedTemplate)}
                  onClick={beginGoalPipeline}
                >
                  <Send size={17} />
                  {isGeneratingPlan ? "Preparing questions" : "Start with this problem"}
                </button>
              </div>
            </section>
          )}
        </div>

        {!showSettings && selectedFile ? (
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
        ) : null}
      </section>

      <aside className="right-rail">
        <section className="reflection-card">
          <div className="section-title">
            <BrainCircuit size={17} />
            <span>AI reflection</span>
          </div>
          <h2>{selectedFile ? "Understood problem" : "How it works"}</h2>
          <p>
            {selectedFile
              ? questionSet.summary
              : "Solution Factory starts with your real situation, reflects what it understood, then turns the goal into an editable action map."}
          </p>
          {selectedFile ? <p>{questionSet.bottleneck}</p> : null}
        </section>

        <section className="question-panel generated">
          <div className="section-title">
            <MessageSquareText size={17} />
            <span>
              {selectedFile ? "Personalizing questions" : "What comes next"}
            </span>
          </div>
          <ul>
            {(selectedFile
              ? questionSet.questions
              : [
                  "What is the real situation?",
                  "What would a better version of life look like?",
                  "What constraints should the plan respect?",
                ]
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
            {aiStatus === "live"
              ? "OpenRouter generated the first reflection. The next step is turning answers into milestones, risks, and weekly actions."
              : aiStatus === "error"
                ? "OpenRouter failed, so local demo questions are shown. Check the key/model and try again."
                : "No plan should be generated until the app has enough context to avoid generic advice."}
          </p>
        </section>
      </aside>
    </main>
  );
}

export default App;
