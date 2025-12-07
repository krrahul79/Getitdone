export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email?: string;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  color: string;
  join_code: string;
  created_by: string;
  created_at: string;
  members?: UserProfile[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  group_id: string;
  due_date: string | null;
  is_completed: boolean;
  created_by: string;
  assignees: string[];
  assignee_profiles: UserProfile[];
}

export interface ActivityItem {
  id: number;
  description: string;
  created_at: string;
  type: "task_created" | "task_completed" | "group_joined" | "group_created";
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}
