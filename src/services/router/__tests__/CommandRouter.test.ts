import { CommandRouter } from '../CommandRouter';
import { writeNativeAuditExport, writeNativeLog } from '../../../native/NativeLogger';

jest.mock('../../../native/NativeLogger', () => ({
  writeNativeLog: jest.fn(),
  writeNativeAuditExport: jest.fn(),
}));

describe('CommandRouter', () => {
  let router: CommandRouter;

  beforeEach(() => {
    CommandRouter.__resetForTests();
    router = CommandRouter.getInstance();
    jest.clearAllMocks();
  });

  it('executes navigation immediately without confirmation', async () => {
    const cmd = await router.propose('navigate', { screen: 'Explore' });
    expect(cmd.status).toBe('executed');
    expect(cmd.requiresConfirmation).toBe(false);
    expect(router.getLogs()).toHaveLength(1);
    expect(router.getLogs()[0].type).toBe('navigate');
  });

  it('keeps setPreference pending until confirmed and records it in the activity log', async () => {
    const cmd = await router.propose('setPreference', { key: 'theme', value: 'dark' });

    expect(cmd.status).toBe('pending');
    expect(cmd.requiresConfirmation).toBe(true);

    const pending = router.getLogs().find(l => l.id === cmd.id);
    expect(pending).toBeDefined();
    expect(pending!.status).toBe('pending');

    const confirmedCmd = await router.confirm(cmd.id);
    expect(confirmedCmd.status).toBe('executed');
    expect(router.getLogs().find(l => l.id === cmd.id)?.status).toBe('executed');
  });

  it('rejects invalid navigation payload before execution', async () => {
    await expect(router.propose('navigate', { screen: 'Settings' })).rejects.toThrow('Invalid screen');
 });

  it('rejects invalid explore sort key', async () => {
    await expect(
      router.propose('applyExploreFilter', { category: 'Books', sortBy: 'price' }),
    ).rejects.toThrow('Invalid sortBy');
  });

  it('writes audit export via native module using router snapshot', async () => {
    await router.propose('navigate', { screen: 'Home' });
    await router.propose('exportAuditLog', {});

    expect(writeNativeAuditExport).toHaveBeenCalled();
    const arg = (writeNativeAuditExport as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(1);
    expect(writeNativeLog).toHaveBeenCalled();
  });

  it('stores rejection reason on reject', async () => {
    const cmd = await router.propose('setPreference', { key: 'x', value: 1 });
    await router.reject(cmd.id, 'User declined');
    const row = router.getLogs().find(l => l.id === cmd.id);
    expect(row?.status).toBe('rejected');
    expect(row?.rejectionReason).toBe('User declined');
  });
});
