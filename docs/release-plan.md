# macOS Release Plan

## Release Goals

The first public macOS release should prove one thing: a developer can design a
local coding-agent pipeline and run it against a repository with visible logs,
artifacts, and checkpoints.

## v0.1 Release

Scope:

- Public GitHub repository
- Tauri desktop scaffold
- React Flow workbench prototype
- Pipeline JSON schema
- Example fullstack pipeline
- README, roadmap, issue templates

Verification:

- `npm run build`
- Schema and example JSON parse successfully

## v0.2 Release

Scope:

- Shell node execution through Rust
- Log streaming
- Node status updates
- File checkpoint validation

Verification:

- Run a pipeline with `npm run test` or `npm run build`
- Confirm failed shell command marks node as failed
- Confirm checkpoint node validates output files

## v0.5 macOS Release Candidate

Scope:

- Signed macOS app
- Release artifact on GitHub Releases
- Apple Silicon release first; Intel x86_64 packaging is tracked separately
- Demo pipeline included
- Installation instructions

Open questions:

- Signing identity and Apple Developer account
- Notarization workflow
- Auto-update strategy
- Whether releases should ship as `.dmg`, `.app.zip`, or both

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
| `APPLE_API_KEY` | App Store Connect API key contents for notarization |
| `APPLE_API_KEY_ID` | App Store Connect API key ID |
| `APPLE_API_ISSUER` | App Store Connect issuer ID |

Alternative notarization path:

- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`

Implementation notes:

- Prefer App Store Connect API key notarization over Apple ID password auth.
- Keep v0.1 prereleases marked as prerelease until signing is complete.
- Document any manual `xattr` workaround only for contributors and early testers.
- Once signing is configured, verify the downloaded DMG on a clean macOS machine.
