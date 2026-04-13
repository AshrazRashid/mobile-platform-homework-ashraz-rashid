import { Command, CommandType, TabScreenName } from '../../types/commands';
import { writeNativeAuditExport, writeNativeLog } from '../../native/NativeLogger';

export class CommandRouter {
  private static instance: CommandRouter;
  private listeners: ((command: Command) => void)[] = [];
  private activityLog: Command[] = [];

  private readonly COMMAND_CONFIG: Record<CommandType, { requiresConfirm: boolean }> = {
    navigate: { requiresConfirm: false },
    openFlyout: { requiresConfirm: false },
    closeFlyout: { requiresConfirm: false },
    applyExploreFilter: { requiresConfirm: false },
    setPreference: { requiresConfirm: true },
    showAlert: { requiresConfirm: false },
    exportAuditLog: { requiresConfirm: false },
  };

  private constructor() {}

  public static getInstance(): CommandRouter {
    if (!CommandRouter.instance) {
      CommandRouter.instance = new CommandRouter();
    }
    return CommandRouter.instance;
  }

  /** Test-only: reset singleton and log */
  public static __resetForTests(): void {
    CommandRouter.instance = new CommandRouter();
  }

  public async propose(type: CommandType, payload: Record<string, unknown>): Promise<Command> {
    const command: Command = {
      id: Math.random().toString(36).slice(2, 11),
      type,
      payload: { ...payload },
      requiresConfirmation: this.COMMAND_CONFIG[type].requiresConfirm,
      status: 'pending',
      timestamp: Date.now(),
    };

    this.validate(command);

    if (!command.requiresConfirmation) {
      return this.execute(this.normalize(command));
    }

    this.activityLog.push(command);
    this.notify(command);
    return command;
  }

  public async confirm(commandId: string): Promise<Command> {
    const cmd = this.activityLog.find(c => c.id === commandId);
    if (cmd && cmd.status === 'pending') {
      return this.execute(this.normalize({ ...cmd, status: 'confirmed' }));
    }
    throw new Error('Command not found or already processed');
  }

  public async reject(commandId: string, reason: string): Promise<void> {
    const index = this.activityLog.findIndex(c => c.id === commandId);
    if (index === -1) {
      return;
    }
    const updated: Command = {
      ...this.activityLog[index],
      status: 'rejected',
      rejectionReason: reason,
    };
    this.activityLog[index] = updated;
    writeNativeLog(`REJECTED: ${commandId} — ${reason}`);
    this.notify(updated);
  }

  private validate(command: Command): void {
    const p = command.payload;
    switch (command.type) {
      case 'navigate': {
        const screens: TabScreenName[] = ['Home', 'Explore', 'Profile'];
        if (typeof p.screen !== 'string' || !screens.includes(p.screen as TabScreenName)) {
          throw new Error('Invalid screen');
        }
        break;
      }
      case 'openFlyout': {
        if (p.title != null && typeof p.title !== 'string') {
          throw new Error('Invalid flyout title');
        }
        break;
      }
      case 'closeFlyout':
        break;
      case 'applyExploreFilter': {
        if (typeof p.category !== 'string' || p.category.length === 0) {
          throw new Error('Invalid category');
        }
        if (p.sortBy != null && p.sortBy !== 'name' && p.sortBy !== 'date') {
          throw new Error('Invalid sortBy');
        }
        break;
      }
      case 'setPreference': {
        if (typeof p.key !== 'string' || p.key.length === 0 || p.value === undefined) {
          throw new Error('Invalid preference');
        }
        break;
      }
      case 'showAlert': {
        if (typeof p.title !== 'string' || typeof p.message !== 'string') {
          throw new Error('Invalid alert');
        }
        break;
      }
      case 'exportAuditLog': {
        if (p.log !== undefined && !Array.isArray(p.log)) {
          throw new Error('Invalid export log');
        }
        break;
      }
    }
  }

  private normalize(command: Command): Command {
    if (command.type === 'applyExploreFilter') {
      const sort = command.payload.sortBy;
      return {
        ...command,
        payload: {
          category: String(command.payload.category),
          sortBy: sort === 'date' ? 'date' : 'name',
        },
      };
    }
    return command;
  }

  private async execute(command: Command): Promise<Command> {
    if (command.type === 'exportAuditLog') {
      const custom = command.payload.log;
      const rows = Array.isArray(custom) ? custom : this.activityLog;
      writeNativeAuditExport(JSON.stringify(rows));
      writeNativeLog(`EXPORT audit (${Array.isArray(custom) ? 'payload' : 'router'} ${rows.length} rows)`);
    }

    const executedCmd: Command = { ...command, status: 'executed' };
    const index = this.activityLog.findIndex(c => c.id === command.id);
    if (index !== -1) {
      this.activityLog[index] = executedCmd;
    } else {
      this.activityLog.push(executedCmd);
    }

    writeNativeLog(`EXECUTED: ${command.type} @ ${new Date(command.timestamp).toISOString()}`);
    this.notify(executedCmd);
    return executedCmd;
  }

  private notify(command: Command): void {
    this.listeners.forEach(l => l(command));
  }

  public subscribe(fn: (command: Command) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public getLogs(): Command[] {
    return [...this.activityLog];
  }
}
