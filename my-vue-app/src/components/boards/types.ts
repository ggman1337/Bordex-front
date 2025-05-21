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

export enum Status {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  WAITING_FOR_INPUT = 'WAITING_FOR_INPUT',
  SCHEDULED = 'SCHEDULED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEPLOYED = 'DEPLOYED',
  TESTING = 'TESTING',
  ARCHIVED = 'ARCHIVED',
  QUEUED = 'QUEUED',
  DELAYED = 'DELAYED',
  NEEDS_APPROVAL = 'NEEDS_APPROVAL',
  IN_REVIEW = 'IN_REVIEW',
  VALIDATING = 'VALIDATING',
  IMPLEMENTING = 'IMPLEMENTING',
  BLOCKED = 'BLOCKED',
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
}

export const statusTitles: Record<Status, string> = {
  [Status.NEW]: 'Нужно сделать',
  [Status.IN_PROGRESS]: 'В процессе',
  [Status.REVIEW]: 'Рецензирование',
  [Status.IN_REVIEW]: 'На рассмотрении',
  [Status.DONE]: 'Готово',
  [Status.FAILED]: 'Неуспех',
  [Status.CANCELLED]: 'Отменено',
  [Status.ON_HOLD]: 'Приостановлено',
  [Status.WAITING_FOR_INPUT]: 'Ожидание ввода',
  [Status.SCHEDULED]: 'Запланировано',
  [Status.APPROVED]: 'Утверждено',
  [Status.REJECTED]: 'Отклонено',
  [Status.DEPLOYED]: 'Развернуто',
  [Status.TESTING]: 'Тестирование',
  [Status.ARCHIVED]: 'Архивировано',
  [Status.QUEUED]: 'В очереди',
  [Status.DELAYED]: 'Задержано',
  [Status.NEEDS_APPROVAL]: 'Требует одобрения',
  [Status.VALIDATING]: 'Валидация',
  [Status.IMPLEMENTING]: 'Реализация',
  [Status.BLOCKED]: 'Заблокировано',
  [Status.CLOSED]: 'Закрыто',
  [Status.OPEN]: 'Открыто',
}

export interface Task {
  id: number;
  boardId: number;
  name: string;
  description?: string;
  status: Status;
  tag: { value: TagValue; label: string; color: string };
  assignees?: User[];
  priority?: string;
  deadline?: string | null;
  progress?: number;
}

export interface BoardColumn {
  id: number;
  title: string;
  status: Status;
  tasks: Task[];
}

export interface Board {
  id: number;
  title: string;
  description: string;
  scope: string;
  owner: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  membersCount: number;
  tasksCount: number;
  progress?: number;
}
