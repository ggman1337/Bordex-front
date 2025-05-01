import type { User } from '@/stores/userStore'

export interface Avatar {
  img?: string;
  initials?: string;
}

export type TagValue =
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'BUGS'
  | 'FEATURES'
  | 'ANALYTICS'
  | 'DESIGN'
  | 'DOCUMENTATION'
  | 'RESEARCH'
  | 'MAINTENANCE'
  | 'DEPLOYMENT'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'INFRASTRUCTURE'
  | 'SUPPORT'
  | 'MANAGEMENT'
  | 'INTEGRATION'
  | 'MIGRATION'
  | 'ARCHITECTURE'
  | 'MONITORING'
  | 'OPTIMIZATION'
  | 'CODE_REVIEW'
  | 'QA'
  | 'UX'
  | 'UI'
  | 'STRATEGY'
  | 'TRAINING'
  | 'ONBOARDING'
  | 'AUTOMATION'
  | 'COMPLIANCE'
  | 'INCIDENT_RESPONSE'
  | 'DATABASE'
  | 'BACKEND'
  | 'FRONTEND'
  | 'MOBILE'
  | 'API'
  | 'CLOUD'
  | 'DEVOPS'
  | 'CI_CD'
  | 'LOAD_TESTING'
  | 'UNIT_TESTING'
  | 'E2E_TESTING'
  | 'REGRESSION_TESTING'
  | 'SCRUM'
  | 'KANBAN'
  | 'PRODUCT_MANAGEMENT'
  | 'STAKEHOLDER_COMMUNICATION'
  | 'RISK_MANAGEMENT'
  | 'ROADMAP_PLANNING'
  | 'PROTOTYPING'
  | 'USER_STORY'
  | 'SPRINT_PLANNING'
  | 'RETROSPECTIVE'
  | 'DAILY_STANDUP'
  | 'HOTFIX'
  | 'RELEASE_MANAGEMENT'
  | 'VERSION_CONTROL'
  | 'SEO'
  | 'CONTENT_CREATION'
  | 'BRANDING'
  | 'LEGAL'
  | 'FINANCE'
  | 'CUSTOMER_SUPPORT'
  | 'SALES_SUPPORT'
  | 'PARTNER_INTEGRATION';

export const tagValues: TagValue[] = [
  'DEVELOPMENT',
  'TESTING',
  'BUGS',
  'FEATURES',
  'ANALYTICS',
  'DESIGN',
  'DOCUMENTATION',
  'RESEARCH',
  'MAINTENANCE',
  'DEPLOYMENT',
  'SECURITY',
  'PERFORMANCE',
  'INFRASTRUCTURE',
  'SUPPORT',
  'MANAGEMENT',
  'INTEGRATION',
  'MIGRATION',
  'ARCHITECTURE',
  'MONITORING',
  'OPTIMIZATION',
  'CODE_REVIEW',
  'QA',
  'UX',
  'UI',
  'STRATEGY',
  'TRAINING',
  'ONBOARDING',
  'AUTOMATION',
  'COMPLIANCE',
  'INCIDENT_RESPONSE',
  'DATABASE',
  'BACKEND',
  'FRONTEND',
  'MOBILE',
  'API',
  'CLOUD',
  'DEVOPS',
  'CI_CD',
  'LOAD_TESTING',
  'UNIT_TESTING',
  'E2E_TESTING',
  'REGRESSION_TESTING',
  'SCRUM',
  'KANBAN',
  'PRODUCT_MANAGEMENT',
  'STAKEHOLDER_COMMUNICATION',
  'RISK_MANAGEMENT',
  'ROADMAP_PLANNING',
  'PROTOTYPING',
  'USER_STORY',
  'SPRINT_PLANNING',
  'RETROSPECTIVE',
  'DAILY_STANDUP',
  'HOTFIX',
  'RELEASE_MANAGEMENT',
  'VERSION_CONTROL',
  'SEO',
  'CONTENT_CREATION',
  'BRANDING',
  'LEGAL',
  'FINANCE',
  'CUSTOMER_SUPPORT',
  'SALES_SUPPORT',
  'PARTNER_INTEGRATION'
];

export interface Task {
  id: number;
  boardId: number; // ID of the board this task belongs to
  name: string;
  description?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'DONE';
  tag: { value: TagValue; label: string; color: string };
  assignees?: User[];
  priority?: string;
  deadline?: string | null;
  progress?: number; // 0..100, процент выполнения задачи
}

export interface BoardColumn {
  id: number;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: number;
  title: string;
  description?: string;
  scope?: string;
  owner?: any;
  membersCount: number;
  tasksCount: number;
}
