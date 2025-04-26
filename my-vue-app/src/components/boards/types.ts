export interface Avatar {
  img?: string;
  initials?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  tag: { label: string; color: string };
  avatars: Avatar[];
  assignees?: number[];
}

export interface BoardColumn {
  id: number;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: number;
  title: string;
  members: number;
  tasks: number;
  avatars: Avatar[];
}
