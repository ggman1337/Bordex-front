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
}

export interface BoardColumn {
  id: number;
  title: string;
  tasks: Task[];
}
