export const BOARD_ROLES = [
  'VIEWER',
  'DEVELOPER',
  'MANAGER',
] as const;
export type BoardRole = typeof BOARD_ROLES[number];
