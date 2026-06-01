# Architecture

## Positioning

App Factory Workbench is a local-first Goal-to-Pipeline desktop app. It turns a
messy goal, project, or life situation into a structured action map that the
user can inspect as kanban, timeline, graph, table, or pipeline.

It should not behave like an AI life coach that immediately gives advice. The
core product behavior is:

1. ask better questions
2. reflect the understood problem
3. wait for user correction
4. decompose the confirmed goal
5. render editable planning views

## Stack

- Desktop shell: Tauri
- UI: React, TypeScript, React Flow
- Planning format: JSON
- Templates: checked into `examples/`
- Future execution: Rust-owned local process and filesystem operations

## Core Concepts

### Goal Pipeline

A goal pipeline is a planning graph. It is not necessarily an executable
automation.

Nodes can represent:

- intake questions
- AI-generated follow-up questions
- problem reflection
- goals and subgoals
- milestones
- actions
- checkpoints
- decision points
- risks
- views

Edges represent dependency, sequence, revision, or feedback loops.

### Intake

The app starts with fixed user-facing questions:

- What do you want to change?
- Where are you right now?
- What resources do you already have?
- How much time can you commit?
- What would success look like?

These questions keep the first interaction predictable and prevent the AI from
guessing too early.

### AI Follow-ups

After the fixed intake, AI can generate context-specific follow-ups. These
questions should search for missing constraints, hidden motivation, repeated
decision loops, and risks.

### Problem Reflection

Before generating a plan, the AI writes a reflection:

```text
I understand the problem as...
The main bottleneck appears to be...
What did I misunderstand or miss?
```

The user must be able to confirm or edit this before decomposition.

### Decomposition

The decomposition phase creates:

- main goal
- subgoals
- first 7 days
- first 30 days
- milestones
- checkpoints
- decision points
- risks
- anti-goals

### Views

The plan model should be view-independent. The same underlying plan can render
as:

- kanban
- timeline
- graph
- table
- pipeline

### Future Executable Nodes

Executable behavior is optional and later. Candidate executable nodes:

- AI research
- document generation
- GitHub issue creation
- shell command
- calendar planning
- weekly review

The product should make a clear distinction between planning nodes and
executable nodes.

## Security Model

The current Goal-to-Pipeline flow is a planning surface. When executable nodes
are introduced, they must be explicit and user-controlled:

- show every command or external action before execution
- require user approval for destructive or account-changing actions
- keep generated artifacts inspectable
- distinguish advice, inference, and user-provided facts
- avoid presenting high-stakes personal, medical, legal, or financial output as
  authoritative guidance

Sandboxing, connector permissions, and allowlists are future work.
