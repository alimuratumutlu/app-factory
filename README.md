# App Factory Workbench

A macOS desktop app for designing and running local coding-agent pipelines with
Codex, Claude Code, and shell commands.

App Factory Workbench is a visual runner for local coding-agent pipelines. It is
not another chatbot builder. It gives developers a canvas for designing software
delivery workflows that run against a real local repository, keep state on disk,
and make each agent handoff inspectable.

> We are building an open local orchestration standard and desktop runner for
> Codex-based software delivery pipelines.

## What It Does

- Design pipelines visually with React Flow
- Run node types for Codex, Claude Code, shell commands, file checkpoints, manual
  gates, QA review, and release tasks
- Save pipelines as portable JSON
- Execute locally through a Rust command runner
- Keep artifacts, logs, and checkpoints inside the selected repository
- Ship starter templates, including a fullstack app factory pipeline

## Why This Exists

Coding agents are powerful, but long-running software work still breaks down:

- prompts lose context
- terminal sessions get interrupted
- handoffs between planning, coding, QA, and release are not visible
- generated apps are hard to review after the fact

App Factory Workbench treats coding-agent work as a local pipeline:

```text
Brief -> PM -> Tech Lead -> Backend -> Frontend -> Tests -> QA -> Release
```

Each node has inputs, outputs, a runtime, success criteria, and logs.

## Product Shape

```text
app-factory/
├── src/                         # React + React Flow workbench UI
├── src-tauri/                   # Tauri shell and Rust command runner
├── schema/                      # Open pipeline schema
├── examples/
│   └── fullstack-app-template/  # First ready-made agent pipeline
├── docs/                        # Architecture, roadmap, release plan
└── .github/                     # Issues, release workflow, contribution docs
```

## Runtime Nodes

| Node | Purpose |
| --- | --- |
| Codex | Run a Codex local-agent prompt against a repo |
| Claude Code | Run a Claude Code prompt against a repo |
| Shell | Run tests, build commands, scripts, or custom checks |
| Checkpoint | Assert files exist or match expected output |
| Manual Gate | Pause for human review before continuing |
| QA Review | Inspect generated code and send failures back |
| Release | Build, sign, package, or publish artifacts |

## MVP Scope

The first release focuses on macOS and local execution:

1. Visual pipeline canvas
2. Node config side panel
3. JSON pipeline import/export
4. Sequential execution engine
5. Rust command runner for shell commands
6. Codex and Claude Code adapter stubs
7. Fullstack app template pipeline
8. Run logs and artifact list
9. macOS release build plan

## Performance Position

We are using Tauri + React Flow + Rust because the app has two different
performance profiles:

- The UI is graph editing, node configuration, and logs. React Flow is mature
  enough for this and keeps iteration fast.
- The heavy work is process orchestration. Rust owns command execution,
  cancellation, streaming logs, filesystem checks, and future sandboxing.

This keeps the desktop app lighter than an Electron-first implementation while
still giving us a strong visual UI stack.

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

## macOS Prerelease Install

The current macOS artifact is an unsigned Apple Silicon prerelease. It is useful
for contributors and early testing, but it is not yet a polished public
installer.

Download:

- [App Factory Workbench v0.1.1](https://github.com/alimuratumutlu/app-factory/releases/tag/v0.1.1)

If macOS shows this warning:

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

If the app is still in Downloads:

```bash
xattr -dr com.apple.quarantine "$HOME/Downloads/App Factory Workbench.app"
```

The correct long-term fix is Apple Developer ID signing and notarization. That
work is tracked in
[#11 Prepare macOS signing and notarization workflow](https://github.com/alimuratumutlu/app-factory/issues/11).

## Current Status

This repository is at the initial public scaffold stage. The first milestone is
to turn the static workbench prototype into a runnable local pipeline engine.

The v0.1.1 macOS prerelease is unsigned. Signed and notarized builds are planned
before recommending the app to non-developer users.

## Open Source Roadmap

- v0.1: Static workbench UI, schema, fullstack template
- v0.2: Local shell runner, logs, checkpoint nodes
- v0.3: Codex and Claude Code adapters
- v0.4: Pause/resume, failure routing, QA feedback loops
- v0.5: macOS signed release candidate

## Links

- Tauri project creation docs: https://v2.tauri.app/start/create-project/
- React Flow docs: https://reactflow.dev/
- Codex for Open Source: https://openai.com/form/codex-for-oss/
