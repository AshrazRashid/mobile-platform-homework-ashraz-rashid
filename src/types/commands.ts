export type CommandType =
  | 'navigate'
  | 'openFlyout'
  | 'closeFlyout'
  | 'applyExploreFilter'
  | 'setPreference'
  | 'showAlert'
  | 'exportAuditLog';

export type TabScreenName = 'Home' | 'Explore' | 'Profile';

export interface Command {
  id: string;
  type: CommandType;
  payload: Record<string, unknown>;
  requiresConfirmation: boolean;
  status: 'pending' | 'confirmed' | 'rejected' | 'executed';
  timestamp: number;
  rejectionReason?: string;
}

export type ExploreFilter = {
  category: string;
  sortBy: 'name' | 'date';
};

export type PreferenceUpdate = {
  key: string;
  value: unknown;
};
