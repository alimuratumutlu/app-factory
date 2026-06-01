# App Factory Workbench

Goal-to-Pipeline Workbench for turning messy goals into structured action maps.

App Factory Workbench helps a user describe a complex goal, answer the right
follow-up questions, confirm what the real problem is, and then view the plan as
kanban, timeline, graph, table, or pipeline.

The pipeline is a planning object first. It can later include executable nodes
for AI research, document generation, GitHub issues, shell commands, calendar
planning, or weekly reviews, but the first value is helping the user think,
revise, and choose the next move.

> Design your next move.

## What It Does

- Collects an initial goal, current situation, resources, constraints, and
  desired outcome.
- Uses fixed intake questions before generating context-specific AI follow-ups.
- Reflects the understood problem before proposing a solution.
- Decomposes the confirmed goal into milestones, actions, risks, checkpoints,
  decision points, and anti-goals.
- Lets the user inspect the same plan as kanban, timeline, graph, table, or
  pipeline.
- Keeps the plan editable instead of treating AI output as final.

## Product Flow

```text
Initial Intake
  -> AI Follow-up Questions
  -> Problem Reflection
  -> Goal Decomposition
  -> View Selection
```

### 1. Initial Intake

The user describes:

- what they want to change
- where they are now
- what resources they already have
- how much time they can commit
- what success looks like

### 2. AI Follow-up Questions

The app starts from a small fixed set of questions, then asks AI to generate
better follow-ups from the missing context.

Example follow-ups:

- What is the real motivation behind this goal?
- Is the biggest constraint time, energy, money, skill, or support?
- What would you lose if nothing changes?
- Which decision keeps you stuck right now?

### 3. Problem Reflection

The AI does not jump directly into advice. It first reflects:

```text
I understand the problem as...
The main bottleneck appears to be...
What did I misunderstand or miss?
```

This step prevents the app from generating a polished plan for the wrong
problem.

### 4. Goal Decomposition

After the user confirms or edits the reflection, the app breaks the goal into:

- main goal and subgoals
- first 7 days
- first 30 days
- milestones
- checkpoints
- decision points
- risks
- things not to do

### 5. View Selection

The same plan can be inspected in multiple ways:

| View | Purpose |
| --- | --- |
| Kanban | To do, doing, waiting, done |
| Timeline | Weekly or monthly roadmap |
| Graph | Goals, dependencies, bottlenecks |
| Table | Task, priority, duration, difficulty, impact |
| Pipeline | Staged flow with checkpoints and decision gates |

## Product Shape

```text
app-factory/
├── src/                            # React + React Flow workbench UI
├── src-tauri/                      # Tauri desktop shell
├── schema/                         # Open goal pipeline schema
├── examples/
│   ├── goal-to-pipeline-template/  # Core human planning template
│   └── fullstack-app-template/     # Developer-oriented future template
├── docs/                           # Architecture, roadmap, release plan
└── .github/                        # Issues, release workflow, contribution docs
```

## Future Executable Nodes

Planning comes first, but some nodes can become executable later:

| Node | Future behavior |
| --- | --- |
| AI research | Gather options or summarize context from a user-approved prompt |
| Document generation | Create briefs, plans, PRDs, or review notes |
| GitHub issue | Turn an action plan into tracked repository issues |
| Shell command | Run local project commands when the plan is software-related |
| Calendar planning | Convert milestones into calendar blocks |
| Weekly review | Ask what changed and revise the plan |

## Development

Prerequisites:

- Node.js 20+
- npm 10+
- Rust and Tauri prerequisites for desktop builds

Install and run the frontend:

```bash
npm install
npm run dev
```

Run the desktop app:

```bash
npm run tauri dev
```

Validate the web build:

```bash
npm run build
```

Validate example pipelines:

```bash
npm run validate:examples
```

## macOS Install

The current public macOS prerelease is a signed and notarized Apple Silicon DMG.

Download:

- [App Factory Workbench v0.1.3](https://github.com/alimuratumutlu/app-factory/releases/tag/v0.1.3)
- [App Factory Workbench releases](https://github.com/alimuratumutlu/app-factory/releases)

If macOS shows this warning on `v0.1.1` or another unsigned prerelease:

```text
"App Factory Workbench" is damaged and can't be opened.
You should move it to the Trash.
```

it usually means Gatekeeper quarantined the unsigned app after download. If you
trust the release source and downloaded it from this repository, remove the
quarantine attribute:

```bash
xattr -dr com.apple.quarantine "/Applications/App Factory Workbench.app"
```

The `v0.1.3` prerelease is Developer ID signed and notarized. The older `v0.1.1`
prerelease is unsigned and should be treated as a historical test artifact.

## Current Status

This repository is at the signed public scaffold stage. The current workbench
shows the intended Goal-to-Pipeline experience, but the AI intake, reflection,
decomposition, and multi-view editing flows are not implemented yet.

## Open Source Roadmap

- v0.1: Signed macOS scaffold, Goal-to-Pipeline UI, schema, examples
- v0.2: Editable intake, AI follow-up questions, problem reflection
- v0.3: Goal decomposition and multi-view plan rendering
- v0.4: Persisted plans, checkpoints, weekly review loops
- v0.5: Optional executable nodes for software/project workflows

## Links

- Tauri project creation docs: https://v2.tauri.app/start/create-project/
- React Flow docs: https://reactflow.dev/
- Codex for Open Source: https://openai.com/form/codex-for-oss/
