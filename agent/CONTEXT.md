# Agent context: command-mediated UI

## App purpose

Small React Native demo with three tabs (Home, Explore, Profile) and a bottom agent panel. All agent-driven UI changes are **structured commands** validated and executed by `CommandRouter`, never by the model touching React state directly.

## Agent capabilities and limits

**Can (via commands):** navigate tabs; change Explore category + sort; propose preference updates; open/close a flyout sheet; show a native alert; export the in-memory audit trail to the app **documents directory** through `NativeLogger` (Kotlin / Swift + ObjC bridge, no JS filesystem libraries).

**Cannot:** run arbitrary code; skip validation; bypass confirmation for `setPreference`; mutate navigation or preferences without going through the router.

## Command contract and confirmation

| Command | Example payload | Confirmation |
|--------|-----------------|--------------|
| `navigate` | `{ "screen": "Explore" }` | No |
| `openFlyout` | `{ "title": "Agent" }` (title optional) | No |
| `closeFlyout` | `{}` | No |
| `applyExploreFilter` | `{ "category": "Books", "sortBy": "name" }` | No |
| `setPreference` | `{ "key": "darkMode", "value": true }` | **Yes** |
| `showAlert` | `{ "title": "Hi", "message": "…" }` | No |
| `exportAuditLog` | `{}` or `{ "log": [ … ] }` | No |

**Rules:** payloads must match the allowlisted `CommandType` and pass router validation. `setPreference` surfaces as a **Proposed action** card; execution only after explicit confirm. Rejections are logged with **reason** and timestamp. The router also appends human-readable lines via `writeLog`; `exportAuditLog` writes JSON (`audit_export.json`) via `writeAuditExport`.

## Example interactions

### 1 — Navigation

**User:** “Go to Explore.”  
**Agent:** Proposes `navigate` → router validates screen name → executes immediately → `NavigationContainer` ref performs the tab change.

### 2 — Preference (confirmation)

**User:** “Turn on dark mode.”  
**Agent:** Proposes `setPreference` → status `pending` → UI shows confirm/reject → on confirm, router executes and Profile listeners apply the preference.

### 3 — Audit export

**User:** “Export the audit log.”  
**Agent:** Proposes `exportAuditLog` → router snapshots the activity array (or uses payload `log` if provided and valid) → native module writes `audit_export.json` under app documents / `filesDir` (Android) or `DocumentDirectory` (iOS).
