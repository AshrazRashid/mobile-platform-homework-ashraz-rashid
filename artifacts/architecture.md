# Application Architecture

## Main Layers
- **UI Layer (React Native)**: Standard screen components (`Home`, `Explore`, `Profile`) that render data and emit user interaction events.
- **Agent Interface (`AgentBottomSheet`)**: The user-facing conversational entry point that intercepts text and determines user intent.
- **Command Router**: The definitive execution boundary that parses incoming agent commands, checks them against an allowlist, and synchronizes actions.
- **State Management**: Centralized repository for application state and preferences, strictly modified by the router validations.
- **Native Module (`PlatformManager`)**: An iOS/Android bridge that handles writing execution trace logs to the device filesystem.

## Data Flow (Step-by-Step)
1. The user enters a natural language query into the `AgentBottomSheet`.
2. The agent logic interprets the text and constructs a structural JSON command payload (e.g., `{type: "NAVIGATE", target: "Explore"}`).
3. The generated payload is forwarded to the **Command Router**.
4. The router validates the payload against an application-wide allowlist. **Validation happens here**, and malformed instructions are immediately discarded.
5. If the command performs a destructive or sensitive state modification, the router interrupts execution. **Confirmation happens here** via a UI modal requesting explicit user approval.
6. Upon user approval (or immediately for safe actions), the router dispatches updates to the **State Management** layer.
7. The UI layer automatically repaints based on the updated state.
8. Throughout this cycle, the router asynchronously pushes transaction records to the **Native Module**. **Logging happens here** for persistent device-level auditing.
