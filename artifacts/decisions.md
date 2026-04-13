### Decisions Made

**1. Centralized Command Router**
WHAT: We implemented an explicit Command Router middleware to intercept and validate all agent-generated instructions before they reach the UI state.
WHY: This prevents the agent from arbitrarily mutating application state and guarantees all payloads are structurally safe.

**2. Native Logging Bridge**
WHAT: We created a custom React Native module (`PlatformManager`) to handle trace log exports to the device filesystem.
WHY: Encapsulating logging at the native level demonstrates functional platform bridging and isolates OS-specific file writing from shared JavaScript logic.

**3. Contextual Agent Overlay**
WHAT: The conversational interface was built as a persistent bottom sheet over standard application screens.
WHY: This allows the user to directly observe how agent commands affect the underlying application state in real-time without losing their visual context.

### Alternatives Rejected

**1. Direct State Access for the Agent**
WHAT: We explicitly decided against letting the agent directly call React context setters or navigation dispatchers.
WHY: Offering direct access lacks a safety boundary, introducing critical risks if the agent hallucinates actions toward sensitive user preferences.

**2. External LLM Integration for Demo**
WHAT: We chose to simulate the natural language parsing logic with deterministic mock payloads rather than connecting a live LLM API.
WHY: A simulated inference layer guarantees reliable execution for demo reviewers and eliminates external network dependencies that could cause unexpected failures.
