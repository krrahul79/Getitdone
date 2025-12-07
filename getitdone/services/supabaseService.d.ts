import { Group, Task, UserProfile, ActivityItem } from "./types";

export { Group, Task, UserProfile, ActivityItem };


export const SupabaseService: {
  signUp(email: string, password: string, fullName: string): Promise<{ data: any; error: any }>;
  signIn(email: string, password: string): Promise<{ data: any; error: any }>;
  signOut(): Promise<{ error: any }>;
  getCurrentUser(): Promise<any>;
  createGroup(name: string, icon: string, color: string, joinCode: string): Promise<{ data: Group; error: any }>;
  getMyGroups(): Promise<{ data: Group[]; error: any }>;
  joinGroupByCode(joinCode: string): Promise<{ data: any; error: any }>;
  getGroupWithMembers(groupId: string): Promise<{ data: { group: Group; members: UserProfile[] }; error: any }>;
  getGroupTasks(groupId: string): Promise<{ data: Task[]; error: any }>;
  createTask(taskData: Partial<Task>): Promise<{ data: Task; error: any }>;
  updateTaskStatus(taskId: string, isCompleted: boolean): Promise<{ data: any; error: any }>;
  rescheduleTask(taskId: string, newDate: string): Promise<{ data: any; error: any }>;
  assignUsersToTask(taskId: string, userIds: string[]): Promise<{ data: any; error: any }>;
  removeTaskAssignee(taskId: string, userId: string): Promise<{ data: any; error: any }>;
  getMyAssignedTasks(): Promise<{ data: Task[]; error: any }>;
  getActivityFeed(): Promise<{ data: ActivityItem[]; error: any }>;
  updateProfile(updates: Partial<UserProfile>): Promise<{ data: any; error: any }>;
  registerPushToken(token: string): Promise<{ error: any }>;
};
