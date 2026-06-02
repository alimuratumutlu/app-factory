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
import { recommendSpiritualPractices } from "./lib/spiritualRecommendations";

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

type SolutionMapPlanItem = {
  id: string;
  title: string;
  description?: string;
  timeframe?: string;
  priority?: "low" | "medium" | "high";
};

type SolutionMapAction = SolutionMapPlanItem & {
  dependsOn?: string[];
  effort?: "small" | "medium" | "large";
  impact?: "low" | "medium" | "high";
  status?: "todo" | "doing" | "waiting" | "done";
};

type SolutionMap = {
  id: string;
  title: string;
  version: string;
  problem: {
    bottleneck: string;
    confirmedByUser: boolean;
    original: string;
    understood: string;
  };
  outcome: {
    desired: string;
    successSignals: string[];
  };
  reverseEngineering: {
    currentState: string;
    endState: string;
    gaps: string[];
    leveragePoints: string[];
  };
  actions: SolutionMapAction[];
  antiGoals: string[];
  checkpoints: Array<{
    cadence: string;
    id: string;
    questions: string[];
    title: string;
  }>;
  decisionPoints: Array<{
    deadline?: string;
    id: string;
    question: string;
  }>;
  milestones: SolutionMapPlanItem[];
  risks: Array<{
    id: string;
    mitigation?: string;
    title: string;
  }>;
  subgoals: SolutionMapPlanItem[];
  supportPractices: ReturnType<typeof recommendSpiritualPractices>;
  views: Array<"pipeline" | "graph" | "kanban" | "timeline" | "table">;
};

type ModelOption = {
  label: string;
  value: string;
};

type PracticeType = "Esma" | "Dua" | "Dhikr";

type SpiritualSupportMode = "off" | "gentle" | "integrated";

type SpiritualSupportSettings = {
  allowAiSuggestions: boolean;
  allowedTypes: PracticeType[];
  createReminders: boolean;
  enabled: boolean;
  mode: SpiritualSupportMode;
  preferredTimes: string[];
  showInSolutionMap: boolean;
};

type ModelDropdownProps = {
  id: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: ModelOption[];
  value: string;
};

const practiceTypes: PracticeType[] = ["Esma", "Dua", "Dhikr"];

const spiritualSupportModes: Array<{
  description: string;
  label: string;
  value: SpiritualSupportMode;
}> = [
  {
    description: "Never generate or show spiritual support.",
    label: "Off",
    value: "off",
  },
  {
    description: "Show a separate optional support block.",
    label: "Gentle",
    value: "gentle",
  },
  {
    description: "Allow optional support nodes in solution maps.",
    label: "Integrated",
    value: "integrated",
  },
];

const defaultSpiritualSupportSettings: SpiritualSupportSettings = {
  allowAiSuggestions: true,
  allowedTypes: ["Esma", "Dua"],
  createReminders: false,
  enabled: false,
  mode: "off",
  preferredTimes: [],
  showInSolutionMap: true,
};

function getStoredSpiritualSupportSettings(): SpiritualSupportSettings {
  try {
    const storedSettings = window.localStorage.getItem(
      "solution-factory.spiritual-support",
    );
    if (!storedSettings) {
      return defaultSpiritualSupportSettings;
    }

    const parsed = JSON.parse(storedSettings) as Partial<SpiritualSupportSettings>;
    const mode = spiritualSupportModes.some((item) => item.value === parsed.mode)
      ? (parsed.mode as SpiritualSupportMode)
      : defaultSpiritualSupportSettings.mode;
    const enabled = Boolean(parsed.enabled) && mode !== "off";
    const allowedTypes = Array.isArray(parsed.allowedTypes)
      ? parsed.allowedTypes.filter((type): type is PracticeType =>
          practiceTypes.includes(type as PracticeType),
        )
      : defaultSpiritualSupportSettings.allowedTypes;
    const preferredTimes = Array.isArray(parsed.preferredTimes)
      ? parsed.preferredTimes.filter((time): time is string => typeof time === "string")
      : defaultSpiritualSupportSettings.preferredTimes;

    return {
      allowAiSuggestions:
        typeof parsed.allowAiSuggestions === "boolean"
          ? parsed.allowAiSuggestions
          : defaultSpiritualSupportSettings.allowAiSuggestions,
      allowedTypes: allowedTypes.length > 0 ? allowedTypes : ["Esma"],
      createReminders:
        typeof parsed.createReminders === "boolean"
          ? parsed.createReminders
          : defaultSpiritualSupportSettings.createReminders,
      enabled,
      mode: enabled ? mode : "off",
      preferredTimes,
      showInSolutionMap:
        typeof parsed.showInSolutionMap === "boolean"
          ? parsed.showInSolutionMap
          : defaultSpiritualSupportSettings.showInSolutionMap,
    };
  } catch {
    return defaultSpiritualSupportSettings;
  }
}

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

function stripJsonFence(content: string) {
  return content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
}

function createFallbackSolutionMap({
  file,
  questionSet,
  supportPractices,
}: {
  file: PipelineFile;
  questionSet: QuestionSet;
  supportPractices: ReturnType<typeof recommendSpiritualPractices>;
}): SolutionMap {
  return {
    version: "0.1.0",
    id: `${file.id}-solution-map`,
    title: file.name,
    problem: {
      original: file.description,
      understood: questionSet.summary,
      bottleneck: questionSet.bottleneck,
      confirmedByUser: true,
    },
    outcome: {
      desired: "Create a concrete next version of the situation that can be reviewed within 30 days.",
      successSignals: [
        "The real bottleneck is named",
        "The first visible proof or behavior change exists",
        "A weekly review loop is active",
      ],
    },
    reverseEngineering: {
      endState:
        "The user can describe the desired change, show one concrete signal of progress, and decide what to adjust next.",
      currentState: file.description,
      gaps: [
        "The desired outcome is still broad",
        "The first action has not been converted into proof",
        "Review criteria are not yet explicit",
      ],
      leveragePoints: [
        "Start with one 7-day proof step",
        "Separate practical actions from optional support",
        "Review what changed before expanding the plan",
      ],
    },
    subgoals: [
      {
        id: "clarify-outcome",
        title: "Clarify the target outcome",
        description: "Write the smallest useful version of the change.",
        timeframe: "Day 1",
        priority: "high",
      },
      {
        id: "create-proof",
        title: "Create one visible proof step",
        description: "Do one action that makes progress observable.",
        timeframe: "First 7 days",
        priority: "high",
      },
    ],
    actions: [
      {
        id: "name-current-state",
        title: "Name the current state",
        description: "List the facts, constraints, and what has already been tried.",
        timeframe: "Day 1",
        priority: "high",
        status: "todo",
        effort: "small",
        impact: "high",
        dependsOn: [],
      },
      {
        id: "choose-one-move",
        title: "Choose one next move",
        description: "Pick the smallest action that can create feedback within a week.",
        timeframe: "Day 2",
        priority: "high",
        status: "todo",
        effort: "small",
        impact: "high",
        dependsOn: ["name-current-state"],
      },
      {
        id: "review-feedback",
        title: "Review what changed",
        description: "Compare the result with the intended outcome and adjust the map.",
        timeframe: "Day 7",
        priority: "medium",
        status: "todo",
        effort: "small",
        impact: "medium",
        dependsOn: ["choose-one-move"],
      },
    ],
    milestones: [
      {
        id: "first-proof",
        title: "First proof exists",
        description: "One observable action or artifact exists.",
        timeframe: "7 days",
        priority: "high",
      },
      {
        id: "month-review",
        title: "30-day review",
        description: "Decide whether to continue, revise, or stop this direction.",
        timeframe: "30 days",
        priority: "high",
      },
    ],
    risks: [
      {
        id: "generic-plan",
        title: "The plan becomes generic",
        mitigation: "Keep every action tied to the confirmed bottleneck.",
      },
      {
        id: "support-replaces-action",
        title: "Optional support replaces practical work",
        mitigation: "Keep spiritual support separate and optional.",
      },
    ],
    antiGoals: [
      "Do not treat the first AI answer as final truth.",
      "Do not add spiritual support unless the user enabled it.",
      "Do not expand the plan before the first feedback loop exists.",
    ],
    decisionPoints: [
      {
        id: "continue-or-revise",
        question: "After 7 days, did this next move create useful evidence?",
        deadline: "Day 7",
      },
    ],
    checkpoints: [
      {
        id: "weekly-review",
        title: "Weekly review",
        cadence: "weekly",
        questions: [
          "What changed?",
          "What created evidence?",
          "What should be removed from the plan?",
        ],
      },
    ],
    supportPractices,
    views: ["pipeline", "graph", "kanban", "timeline", "table"],
  };
}

function parseSolutionMap(content: string, fallback: SolutionMap) {
  try {
    const parsed = JSON.parse(stripJsonFence(content)) as Partial<SolutionMap>;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.title === "string" &&
      parsed.problem?.original &&
      parsed.problem?.understood &&
      parsed.problem?.bottleneck &&
      parsed.outcome?.desired &&
      Array.isArray(parsed.actions) &&
      Array.isArray(parsed.checkpoints)
    ) {
      return {
        ...fallback,
        ...parsed,
        problem: {
          ...fallback.problem,
          ...parsed.problem,
          confirmedByUser: true,
        },
        supportPractices: fallback.supportPractices,
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

async function requestOpenRouterSolutionMap({
  apiKey,
  fallback,
  file,
  model,
  questionSet,
}: {
  apiKey: string;
  fallback: SolutionMap;
  file: PipelineFile;
  model: string;
  questionSet: QuestionSet;
}) {
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
            "You are Solution Factory's solution-map generator. Work backward from the desired outcome. Return only strict JSON. Separate practical actions from optional supportPractices. Do not include spiritual support unless it is already provided in the input.",
        },
        {
          role: "user",
          content: JSON.stringify({
            goal: file.description,
            reflection: questionSet.summary,
            bottleneck: questionSet.bottleneck,
            requiredShape: {
              version: "0.1.0",
              id: "string",
              title: "string",
              problem: {
                original: "string",
                understood: "string",
                bottleneck: "string",
                confirmedByUser: true,
              },
              outcome: { desired: "string", successSignals: ["string"] },
              reverseEngineering: {
                endState: "string",
                currentState: "string",
                gaps: ["string"],
                leveragePoints: ["string"],
              },
              subgoals: ["plan item objects"],
              actions: ["action objects with id/title/timeframe/priority/status/effort/impact/dependsOn"],
              milestones: ["plan item objects"],
              risks: ["risk objects"],
              antiGoals: ["string"],
              decisionPoints: ["decision point objects"],
              checkpoints: ["checkpoint objects"],
              supportPractices: fallback.supportPractices,
              views: ["pipeline", "graph", "kanban", "timeline", "table"],
            },
          }),
        },
      ],
      temperature: 0.35,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter solution map request failed: ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  return typeof content === "string" ? parseSolutionMap(content, fallback) : fallback;
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

function getSolutionMapPlanRows(solutionMap: SolutionMap | null) {
  if (!solutionMap) return planRows;

  return [
    ...solutionMap.actions.map((action) => [
      action.timeframe ?? "Next",
      action.title,
      action.priority === "high"
        ? "High"
        : action.priority === "medium"
          ? "Medium"
          : "Low",
      "Action",
    ] as [string, string, string, string]),
    ...solutionMap.checkpoints.slice(0, 2).map((checkpoint) => [
      checkpoint.cadence,
      checkpoint.title,
      "Medium",
      "Checkpoint",
    ] as [string, string, string, string]),
  ].slice(0, 6);
}

function getSolutionMapKanbanColumns(solutionMap: SolutionMap | null) {
  if (!solutionMap) return kanbanColumns;

  return [
    {
      title: "To do",
      items: solutionMap.actions
        .filter((action) => action.status === "todo" || !action.status)
        .map((action) => action.title),
    },
    {
      title: "Doing",
      items: solutionMap.actions
        .filter((action) => action.status === "doing")
        .map((action) => action.title),
    },
    {
      title: "Review",
      items: [
        ...solutionMap.checkpoints.map((checkpoint) => checkpoint.title),
        ...solutionMap.decisionPoints.map((decision) => decision.question),
      ],
    },
    {
      title: "Risks",
      items: solutionMap.risks.map((risk) => risk.title),
    },
  ];
}

function getSolutionMapTimelineItems(solutionMap: SolutionMap | null) {
  if (!solutionMap) return timelineItems;

  return [
    ...solutionMap.actions.map((action) => [
      action.timeframe ?? "Next",
      action.title,
    ] as [string, string]),
    ...solutionMap.milestones.map((milestone) => [
      milestone.timeframe ?? "Milestone",
      milestone.title,
    ] as [string, string]),
  ].slice(0, 8);
}

function createSolutionMapFlow(solutionMap: SolutionMap) {
  const flowNodes: Node<GoalNodeData>[] = [
    {
      id: "current-state",
      position: { x: 0, y: 100 },
      data: {
        label: "Current state",
        kind: "context",
        description: solutionMap.reverseEngineering.currentState,
      },
    },
    {
      id: "bottleneck",
      position: { x: 180, y: 100 },
      data: {
        label: "Bottleneck",
        kind: "reflection",
        description: solutionMap.problem.bottleneck,
      },
    },
    {
      id: "desired-outcome",
      position: { x: 760, y: 100 },
      data: {
        label: "Desired outcome",
        kind: "outcome",
        description: solutionMap.outcome.desired,
      },
    },
  ];
  const flowEdges: Edge[] = [
    { id: "current-bottleneck", source: "current-state", target: "bottleneck" },
  ];

  solutionMap.actions.slice(0, 4).forEach((action, index) => {
    const nodeId = `action-${action.id}`;
    flowNodes.push({
      id: nodeId,
      position: { x: 340 + index * 135, y: index % 2 === 0 ? 40 : 170 },
      data: {
        label: action.title,
        kind: "action",
        description: action.description ?? "",
      },
    });
    flowEdges.push({
      id: `${index === 0 ? "bottleneck" : `action-${solutionMap.actions[index - 1].id}`}-${nodeId}`,
      source: index === 0 ? "bottleneck" : `action-${solutionMap.actions[index - 1].id}`,
      target: nodeId,
    });
  });

  const renderedActions = solutionMap.actions.slice(0, 4);
  const lastAction = renderedActions[renderedActions.length - 1];
  if (lastAction) {
    flowEdges.push({
      id: `action-${lastAction.id}-outcome`,
      source: `action-${lastAction.id}`,
      target: "desired-outcome",
    });
  }

  return { edges: flowEdges, nodes: flowNodes };
}

function renderPlanView(
  selectedView: ViewMode,
  graphState: GraphState,
  selectedProject: WorkspaceProject,
  selectedFile: PipelineFile,
  solutionMap: SolutionMap | null,
) {
  if (selectedView === "Kanban") {
    const columns = getSolutionMapKanbanColumns(solutionMap);
    return (
      <div className="plan-view kanban-board">
        {columns.map((column) => (
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
    const items = getSolutionMapTimelineItems(solutionMap);
    return (
      <div className="plan-view timeline-view">
        {items.map(([time, action]) => (
          <div className="timeline-item" key={`${time}-${action}`}>
            <span>{time}</span>
            <strong>{action}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (selectedView === "Table") {
    const rows = getSolutionMapPlanRows(solutionMap);
    return (
      <div className="plan-view detail-table">
        <div className="detail-table-row detail-table-head">
          <span>When</span>
          <span>Action</span>
          <span>Priority</span>
          <span>Type</span>
        </div>
        {rows.map(([time, action, priority, type]) => (
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
      nodes={solutionMap ? createSolutionMapFlow(solutionMap).nodes : graphState.nodes}
      edges={solutionMap ? createSolutionMapFlow(solutionMap).edges : graphState.edges}
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
  const [spiritualSupport, setSpiritualSupport] = useState(
    getStoredSpiritualSupportSettings,
  );
  const [intakeText, setIntakeText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [questionSet, setQuestionSet] = useState<QuestionSet>(defaultQuestionSet);
  const [solutionMapsByFileId, setSolutionMapsByFileId] = useState<
    Record<string, SolutionMap>
  >({});
  const [aiStatus, setAiStatus] = useState<"idle" | "local" | "live" | "error">(
    "idle",
  );
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const selectedFile =
    selectedProject.files.find((file) => file.id === selectedFileId) ??
    selectedProject.files[0] ??
    null;
  const selectedTemplate = intakeTemplates.find(
    (template) => template.id === selectedTemplateId,
  );
  const selectedSolutionMap = selectedFile
    ? solutionMapsByFileId[selectedFile.id] ?? null
    : null;
  const spiritualRecommendations = useMemo(
    () =>
      recommendSpiritualPractices({
        settings: spiritualSupport,
        text: [
          selectedFile?.name,
          selectedFile?.description,
          questionSet.summary,
          questionSet.bottleneck,
        ]
          .filter(Boolean)
          .join(" "),
      }),
    [questionSet.bottleneck, questionSet.summary, selectedFile, spiritualSupport],
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
    window.localStorage.setItem(
      "solution-factory.spiritual-support",
      JSON.stringify(spiritualSupport),
    );
  }

  function updateSpiritualSupport(patch: Partial<SpiritualSupportSettings>) {
    setSpiritualSupport((current) => {
      const next = { ...current, ...patch };
      if (patch.mode === "off" || patch.enabled === false) {
        return { ...next, enabled: false, mode: "off" };
      }
      if (patch.mode === "gentle" || patch.mode === "integrated") {
        return { ...next, enabled: true, mode: patch.mode };
      }
      if (patch.enabled === true && next.mode === "off") {
        return { ...next, enabled: true, mode: "gentle" };
      }
      return next;
    });
  }

  function togglePracticeType(type: PracticeType) {
    setSpiritualSupport((current) => {
      const hasType = current.allowedTypes.includes(type);
      const nextTypes = hasType
        ? current.allowedTypes.filter((item) => item !== type)
        : [...current.allowedTypes, type];

      return {
        ...current,
        allowedTypes: nextTypes.length > 0 ? nextTypes : [type],
      };
    });
  }

  function updatePreferredTime(index: number, value: string) {
    setSpiritualSupport((current) => {
      const nextTimes = [...current.preferredTimes];
      nextTimes[index] = value;
      return {
        ...current,
        preferredTimes: nextTimes.filter(Boolean),
      };
    });
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

  async function confirmReflectionAndGenerateMap() {
    if (!selectedFile || isGeneratingMap) {
      return;
    }

    const fallback = createFallbackSolutionMap({
      file: selectedFile,
      questionSet,
      supportPractices: spiritualRecommendations,
    });

    setIsGeneratingMap(true);
    setSolutionMapsByFileId((current) => ({
      ...current,
      [selectedFile.id]: fallback,
    }));

    try {
      if (!openRouterKey.trim()) {
        setAiStatus("local");
        return;
      }

      const liveMap = await requestOpenRouterSolutionMap({
        apiKey: openRouterKey.trim(),
        fallback,
        file: selectedFile,
        model: openRouterModel.trim() || openRouterModelOptions[0].value,
        questionSet,
      });
      setSolutionMapsByFileId((current) => ({
        ...current,
        [selectedFile.id]: liveMap,
      }));
      setAiStatus("live");
    } catch {
      setSolutionMapsByFileId((current) => ({
        ...current,
        [selectedFile.id]: fallback,
      }));
      setAiStatus("error");
    } finally {
      setIsGeneratingMap(false);
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
                ? "Settings"
                : selectedFile
                  ? selectedFile.name
                  : "Describe the problem you want to solve"}
            </h2>
            <p>
              {showSettings
                ? "Add model providers and choose whether optional spiritual support can appear in solution maps."
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
                    Save settings
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

                <section
                  className={
                    spiritualSupport.enabled
                      ? "provider-card spiritual-card enabled"
                      : "provider-card spiritual-card"
                  }
                >
                  <div className="provider-card-top">
                    <div className="provider-logo spiritual-logo">
                      <HeartPulse size={19} />
                    </div>
                    <div>
                      <h4>Spiritual support</h4>
                      <p>
                        Optional Esma, dua, or dhikr support for reflection,
                        not a guaranteed solution. It stays hidden unless the
                        user enables it.
                      </p>
                    </div>
                    <span
                      className={
                        spiritualSupport.enabled ? "provider-status ready" : "provider-status"
                      }
                    >
                      {spiritualSupport.enabled ? "Enabled" : "Off"}
                    </span>
                  </div>

                  <div className="support-settings-grid">
                    <div className="support-toggle-row">
                      <div>
                        <strong>Enable spiritual support</strong>
                        <span>
                          Keep this off to prevent spiritual recommendations from
                          appearing in AI output or plan views.
                        </span>
                      </div>
                      <button
                        aria-pressed={spiritualSupport.enabled}
                        className={
                          spiritualSupport.enabled
                            ? "settings-switch active"
                            : "settings-switch"
                        }
                        onClick={() =>
                          updateSpiritualSupport({
                            enabled: !spiritualSupport.enabled,
                          })
                        }
                        type="button"
                      >
                        <span />
                      </button>
                    </div>

                    <div className="settings-group">
                      <span>Support mode</span>
                      <div className="support-mode-grid">
                        {spiritualSupportModes.map((mode) => {
                          const isActive = spiritualSupport.mode === mode.value;

                          return (
                            <button
                              className={
                                isActive
                                  ? "support-mode-option active"
                                  : "support-mode-option"
                              }
                              key={mode.value}
                              onClick={() => updateSpiritualSupport({ mode: mode.value })}
                              type="button"
                            >
                              <strong>{mode.label}</strong>
                              <span>{mode.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="settings-group">
                      <span>Allowed practice types</span>
                      <div className="practice-type-row">
                        {practiceTypes.map((type) => {
                          const isSelected = spiritualSupport.allowedTypes.includes(type);

                          return (
                            <button
                              className={
                                isSelected
                                  ? "practice-type-chip selected"
                                  : "practice-type-chip"
                              }
                              disabled={!spiritualSupport.enabled}
                              key={type}
                              onClick={() => togglePracticeType(type)}
                              type="button"
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="settings-group">
                      <span>Preferred reminder times</span>
                      <div className="support-time-grid">
                        {[
                          ...spiritualSupport.preferredTimes,
                          "",
                        ]
                          .slice(0, 3)
                          .map((time, index) => (
                            <label className="provider-field" key={`time-${index}`}>
                              <span>Time {index + 1}</span>
                              <input
                                disabled={!spiritualSupport.enabled}
                                type="time"
                                value={time}
                                onChange={(event) =>
                                  updatePreferredTime(index, event.target.value)
                                }
                              />
                            </label>
                          ))}
                      </div>
                    </div>

                    <div className="support-permission-grid">
                      {[
                        {
                          key: "allowAiSuggestions",
                          label: "Allow AI suggestions",
                          text: "AI may suggest matching support practices when enabled.",
                        },
                        {
                          key: "showInSolutionMap",
                          label: "Show in solution maps",
                          text: "Optional support can appear beside practical steps.",
                        },
                        {
                          key: "createReminders",
                          label: "Create reminders",
                          text: "Future reminder nodes may use preferred times.",
                        },
                      ].map((item) => {
                        const key = item.key as keyof Pick<
                          SpiritualSupportSettings,
                          "allowAiSuggestions" | "showInSolutionMap" | "createReminders"
                        >;
                        const isSelected = Boolean(spiritualSupport[key]);

                        return (
                          <button
                            aria-pressed={isSelected}
                            className={
                              isSelected
                                ? "support-permission selected"
                                : "support-permission"
                            }
                            disabled={!spiritualSupport.enabled}
                            key={item.key}
                            onClick={() =>
                              updateSpiritualSupport({ [key]: !isSelected })
                            }
                            type="button"
                          >
                            <CheckCircle2 size={16} />
                            <span>
                              <strong>{item.label}</strong>
                              <em>{item.text}</em>
                            </span>
                          </button>
                        );
                      })}
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
              selectedSolutionMap,
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
              {getSolutionMapPlanRows(selectedSolutionMap).map(([time, action, priority, type]) => (
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
          {selectedFile ? (
            <button
              className="reflection-confirm"
              disabled={isGeneratingMap}
              onClick={confirmReflectionAndGenerateMap}
              type="button"
            >
              <CheckCircle2 size={16} />
              {selectedSolutionMap
                ? "Regenerate solution map"
                : isGeneratingMap
                  ? "Generating solution map"
                  : "Confirm reflection and generate map"}
            </button>
          ) : null}
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

        {selectedFile && spiritualRecommendations.length > 0 ? (
          <section className="spiritual-support-panel">
            <div className="section-title">
              <HeartPulse size={17} />
              <span>Optional support</span>
            </div>
            <div className="spiritual-recommendation-list">
              {spiritualRecommendations.map((recommendation) => (
                <article className="spiritual-recommendation" key={recommendation.id}>
                  <div>
                    <strong>{recommendation.label}</strong>
                    <span>{recommendation.transliteration}</span>
                  </div>
                  <p>{recommendation.reason}</p>
                  <dl>
                    <div>
                      <dt>Day</dt>
                      <dd>{recommendation.schedule.timingLabel}</dd>
                    </div>
                    <div>
                      <dt>Count</dt>
                      <dd>{recommendation.schedule.count}</dd>
                    </div>
                    {recommendation.schedule.timeOfDay ? (
                      <div>
                        <dt>Time</dt>
                        <dd>{recommendation.schedule.timeOfDay}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <small>
                    {recommendation.source.origin} · {recommendation.source.reviewStatus}
                    <br />
                    {recommendation.source.project} / {recommendation.source.path}
                  </small>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="checkpoint-card">
          <div className="section-title">
            <CheckCircle2 size={17} />
            <span>Checkpoint</span>
          </div>
          <p>
            {aiStatus === "live"
              ? selectedSolutionMap
                ? "OpenRouter generated a structured solution map. Pipeline and table views now read from the same map."
                : "OpenRouter generated the first reflection. Confirm it before generating the solution map."
              : aiStatus === "error"
                ? "OpenRouter failed, so local fallback content is shown. Check the key/model and try again."
                : selectedSolutionMap
                  ? "A local fallback solution map is ready. It works backward from the confirmed reflection."
                  : "No solution map should be generated until the reflection is confirmed."}
          </p>
        </section>
      </aside>
    </main>
  );
}

export default App;
