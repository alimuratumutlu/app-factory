# macOS Release Plan

## Release Goals

The first public macOS release should prove one thing: App Factory Workbench is
a credible signed desktop surface for turning messy goals into editable action
maps.

The early product is not an autonomous runner. It is a Goal-to-Pipeline
workbench where the user can describe a goal, answer questions, review the AI's
understanding, and inspect a structured plan.

## v0.1 Release

Scope:

- Public GitHub repository
- Tauri desktop scaffold
- White Goal-to-Pipeline workbench prototype
- Goal pipeline JSON schema
- Goal-to-pipeline example template
- Signed and notarized Apple Silicon prerelease
- README, roadmap, issue templates

Verification:

- `npm run build`
- Schema and example JSON parse successfully

## v0.2 Release

Scope:

- Editable initial intake
- AI key settings
- Fixed base question flow
- AI-generated follow-up questions
- Problem reflection with user confirmation/correction

Verification:

- User can enter a goal and current state
- User can see fixed intake questions
- AI follow-up questions are generated from the intake context
- AI reflection is shown before any plan is generated
- User can correct the reflection

## v0.3 Release

Scope:

- Goal decomposition
- First 7 days and first 30 days planning blocks
- Milestones, actions, risks, checkpoints, and decision points
- Kanban, timeline, graph, table, and pipeline view selection
- Plan import/export

Open questions:

- Which AI providers should be supported first
- How to store local API keys safely
- Whether plan files should live inside a selected workspace
- Auto-update strategy
- Whether releases should ship as `.dmg`, `.app.tar.gz`, or both

## Signing and Notarization Requirements

Unsigned prereleases may trigger macOS Gatekeeper warnings such as:

```text
"App Factory Workbench" is damaged and can't be opened.
You should move it to the Trash.
```

That warning should not be treated as acceptable for a public release. Public
macOS builds must be signed with a Developer ID certificate and notarized by
Apple.

Required Apple assets:

- Paid Apple Developer Program membership
- Developer ID Application certificate
- Certificate exported as a `.p12`
- App Store Connect API key for notarization, or Apple ID app-specific password
- Apple Team ID

Required GitHub Actions secrets:

| Secret | Purpose |
| --- | --- |
| `APPLE_CERTIFICATE` | Base64-encoded `.p12` signing certificate |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the `.p12` certificate |
| `APPLE_SIGNING_IDENTITY` | Developer ID Application identity |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `APPLE_API_KEY` | App Store Connect API key ID for Tauri notarization |
| `APPLE_API_KEY_ID` | App Store Connect API key ID |
| `APPLE_API_PRIVATE_KEY` | Downloaded `.p8` private key contents |
| `APPLE_API_ISSUER` | App Store Connect issuer ID |

Alternative notarization path:

- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`

Implementation notes:

- Prefer App Store Connect API key notarization over Apple ID password auth.
- Keep v0.1 prereleases marked as prerelease while the app is still a scaffold.
- Document any manual `xattr` workaround only for contributors and early testers.
- Once signing is configured, verify the downloaded DMG on a clean macOS machine.

Current signing status:

- `v0.1.3` is Developer ID signed and notarized.
- The downloaded `v0.1.3` DMG was verified with `codesign`, `spctl`, and
  `xcrun stapler validate`.
