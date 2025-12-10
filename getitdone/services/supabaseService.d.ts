import { Group, Task, UserProfile, ActivityItem } from "./types";

export { Group, Task, UserProfile, ActivityItem };

export const SupabaseService: {
  // Auth
  signUp(email: string, password: string, fullName: string): Promise<{ data: any; error: any }>;
  signIn(email: string, password: string): Promise<{ data: any; error: any }>;
  signOut(): Promise<{ error: any }>;
  getCurrentUser(): Promise<{ user: any; profile: UserProfile | null }>;
  
  // Groups
  createGroup(name: string, icon: string, color: string, joinCode: string): Promise<{ data: Group; error: any }>;
  getMyGroups(): Promise<{ data: Group[]; error: any }>;
  joinGroupByCode(joinCode: string): Promise<{ data: any; error: any }>;
  getGroupWithMembers(groupId: string): Promise<{ data: { group: Group; members: UserProfile[] } | null; error: any }>;
  updateGroup(groupId: string, updates: Partial<Group>): Promise<{ data: Group; error: any }>;
  leaveGroup(groupId: string): Promise<{ error: any }>;
  deleteGroup(groupId: string): Promise<{ error: any }>;
  
  // Tasks
  getGroupTasks(groupId: string): Promise<{ data: Task[]; error: any }>;
  getTask(taskId: string): Promise<{ data: Task & { groupName?: string }; error: any }>;
  createTask(taskData: Partial<Task>): Promise<{ data: Task; error: any }>;
  updateTaskDetails(taskId: string, updates: { title?: string; description?: string }, assigneeIds?: string[]): Promise<{ error: any }>;
  updateTaskStatus(taskId: string, isCompleted: boolean): Promise<{ data: any; error: any }>;
  rescheduleTask(taskId: string, newDate: string): Promise<{ data: any; error: any }>;
  assignUsersToTask(taskId: string, userIds: string[]): Promise<{ data: any; error: any }>;
  removeTaskAssignee(taskId: string, userId: string): Promise<{ data: any; error: any }>;
  getMyAssignedTasks(): Promise<{ data: Task[]; error: any }>;
  
  // Activity & Notifications
  getActivityFeed(): Promise<{ data: ActivityItem[]; error: any }>;
  registerPushToken(token: string): Promise<{ error: any }>;
  
  // Profile
  updateProfile(updates: Partial<UserProfile>): Promise<{ data: any; error: any }>;
  uploadAvatar(localUri: string): Promise<{ publicUrl: string | null; error: any }>;
  getProfileStats(): Promise<{ tasksDone: number; groupsCount: number }>;
};
