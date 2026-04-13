# Agent-Driven React Native App

## Architecture (TL;DR)
This application employs an Agent-Driven UI architecture managed by a strictly controlled Command Router. The underlying concept relies on completely decoupling the conversational agent from direct UI state manipulation. The user inputs intent via the `AgentBottomSheet`, which is converted into discrete command payloads (e.g., `NAVIGATE`, `UPDATE_PREFERENCE`). These payloads are fed into a centralized middleware routing pipeline. The router performs structural validation, checks against an execution allowlist, and handles synchronization. For sensitive commands, the router intercepts execution to mandate explicit user confirmation via a UI dialog. Once cleared, commands mutate the application state. Concurrently, all actions route through a custom Native Module platform bridge, persisting transaction logs directly to the local filesystem.

## Key decisions
- **Centralized Command Router Pipeline**: Abstracted validation away from UI components, enforcing a strict bottleneck that prevents the agent from arbitrarily hallucinating state updates.
- **Mandatory Validation Boundaries**: Explicitly modeled payloads to ensure components receive strongly-typed intents rather than unpredictable strings.
- **Dynamic Confirmation Intercepts**: Configured the router to pause processing and mount UI prompts on restricted actions, strictly preserving user autonomy over data mutations. 
- **Isolated Native Logging**: Selected a custom Native Module implementation to prove cross-platform JS-to-Native bridging, handling filesystem permissions securely apart from the shared UI layer.
- **Contextual Agent Overlay (BottomSheet)**: Layered the conversational agent over the native navigation stack so users can directly observe UI and state changes executing in real-time behind the chat interface.
- **Simulated Inference Layer**: Rejected live LLM dependencies in favor of deterministic mocking to guarantee test consistency and avoid network/API rate limiting during code reviews.

## Demo script
1. **Launch App**: Open the specific build to view the generic Home screen.
2. **Summon Agent**: Tap the floating action button to slide up the `AgentBottomSheet` conversational interface.
3. **Execute Navigation**: Type command "Go to explore page". The text converts to a contextual `NAVIGATE` payload, clears router validation, and navigates the backdrop view.
4. **Execute Safe Application**: Type "Show me only active items". The agent pushes a safe `FILTER_STATE` command, passing validation to passively update the main list.
5. **Initiate High-Risk Mutation**: Request a destructive command like "Reset my user preferences".
6. **Confirmation Intercept**: Observe the Command Router pause the payload execution and mount an explicit system-level confirmation dialog.
7. **Complete and Validate**: Tap "Approve" against the dialog, allowing state modification to clear. Check native console logs to verify that the native filesystem bridge successfully recorded the full trace of that interaction.

## Next steps
- **Schema Enforcement**: Add strict `Zod` or `Yup` schema boundaries to the Command Router to automatically reject structurally invalid payload objects at the middleware level.
- **UI State Context Injection**: Seamlessly feed the current application context window (current route, active filters) backwards into the agent prompt so it innately understands visual layout without explicit user explanation.
- **Atomic Command Batching**: Extend the parser logic to process arrays of commands sequentially, allowing users to queue complex multi-step UI transitions (e.g., "Navigate to explore and enable dark mode").

## AI disclosure
AI tooling was utilized to accelerate boilerplate scaffolding, general syntax generation, and React component stubbing during the construction of this codebase. However, all critical architectural decisions—including the implementation of the Command Router separation, state validation techniques, explicit confirmation strategies, and the integration of the React Native platform bridge—were entirely manually reasoned and written by me to reflect intentional engineering tradeoffs.
