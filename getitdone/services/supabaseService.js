import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION ---
const supabaseUrl =
  process.env.SUPABASE_URL || "https://qcycnbdjuomiavaxtror.supabase.co";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_OFLFnePMjRZPLry8X-_lIA_euNl1gK7";
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("YOUR_SUPABASE")) {
  console.warn("⚠️ Supabase keys are missing! Check .env");
}

// --- SINGLE CLIENT INSTANCE ---
// Standard client. It automatically handles Auth headers for RLS.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SupabaseService = {
  // --- AUTHENTICATION ---

  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }, // Triggers 'handle_new_user' SQL function
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    // 1. Get the Session User
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return { user: null, profile: null };
    }

    // 2. Fetch the Profile Data (linked by ID)
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { user, profile };
  },

  // --- GROUPS ---

  async createGroup(name, icon, color, join_code) {
    // 1. GET AUTH ID (Trusted Source)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Create Group Failed: No active session.");
      return { error: { message: "You must be logged in." } };
    }

    // 2. INSERT GROUP (Using Trusted ID)
    // We do NOT use a passed 'profileId' argument. We use 'user.id' directly.
    // This satisfies the RLS policy: (auth.uid() = created_by)
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .insert([
        {
          name,
          icon,
          color,
          join_code,
          created_by: user.id, // <--- MATCHES AUTH TOKEN
        },
      ])
      .select()
      .single();

    if (groupError) {
      console.error("Group Insert Error:", groupError);
      return { error: groupError };
    }

    // 3. INSERT MEMBER (Admin)
    const { error: memberError } = await supabase.from("group_members").insert([
      {
        group_id: groupData.id,
        user_id: user.id,
        is_admin: true,
      },
    ]);

    return { data: groupData, error: memberError };
  },

  async getMyGroups() {
    // RLS automatically filters this query to only show groups the user is in.
    // We don't need manual filters.
    const { data, error } = await supabase.from("groups").select(`
        id, name, icon, color, join_code,
        group_members!inner (user_id)
      `);

    return { data, error };
  },

  async joinGroupByCode(code) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    // 1. Find Group
    const { data: group, error: searchError } = await supabase
      .from("groups")
      .select("id")
      .eq("join_code", code)
      .single();

    if (searchError || !group) return { error: "Invalid Group Code" };

    // 2. Join
    const { error: joinError } = await supabase
      .from("group_members")
      .insert([{ group_id: group.id, user_id: user.id }]);

    return { error: joinError };
  },

  // --- TASKS ---

  async getGroupTasks(groupId) {
    const { data, error } = await supabase
      .from("tasks")
      .select(`*, assignees:task_assignees(user_id)`)
      .eq("group_id", groupId)
      .order("due_date", { ascending: true });
    return { data, error };
  },

  async createTask(taskData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    // 1. Insert Task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert([
        {
          title: taskData.title,
          description: taskData.description,
          group_id: taskData.group_id,
          due_date: taskData.due_date,
          created_by: user.id, // <--- Trusted ID
        },
      ])
      .select()
      .single();

    if (taskError) return { error: taskError };

    // 2. Insert Assignees
    if (taskData.assignees && taskData.assignees.length > 0) {
      const assigneeRows = taskData.assignees.map((uid) => ({
        task_id: task.id,
        user_id: uid,
      }));
      await supabase.from("task_assignees").insert(assigneeRows);
    }

    return { data: task, error: null };
  },

  async updateTaskStatus(taskId, status) {
    return await supabase.from("tasks").update({ status }).eq("id", taskId);
  },

  async rescheduleTask(taskId, newDate) {
    return await supabase
      .from("tasks")
      .update({ due_date: newDate })
      .eq("id", taskId);
  },

  // --- ACTIVITY ---

  async getActivityFeed() {
    const { data, error } = await supabase
      .from("activity_logs")
      .select(`*, actor:profiles(full_name), group:groups(name)`)
      .order("created_at", { ascending: false })
      .limit(50);
    return { data, error };
  },

  // --- PROFILES ---

  async updateProfile(updates) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    return { data, error };
  },

  // --- GROUP DETAILS ---
  async getGroupWithMembers(groupId) {
    try {
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("id, name, icon, color, join_code, created_by")
        .eq("id", groupId)
        .single();
      if (groupError) return { error: groupError };

      const { data: members, error: membersError } = await supabase
        .from("group_members")
        .select("user_id, is_admin, profiles(id, full_name, avatar_url)")
        .eq("group_id", groupId);
      if (membersError) return { error: membersError };

      // Map members to a clean structure
      const mappedMembers = (members || []).map((m) => ({
        id: m.profiles?.id || m.user_id,
        name: m.profiles?.full_name || null,
        avatar_url: m.profiles?.avatar_url || null,
        is_admin: m.is_admin,
      }));

      return { data: { group, members: mappedMembers }, error: null };
    } catch (e) {
      return { error: e };
    }
  },

  // --- TASKS FOR CURRENT USER ---
  async getMyAssignedTasks() {
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();
    if (sessionError || !user) return { data: [], error: sessionError || null };

    try {
      // Select tasks that have task_assignees for the current user
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id, title, description, group_id, due_date, status, created_by, assignees:task_assignees(user_id)"
        )
        .eq("task_assignees.user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) return { data: [], error };

      // normalize assignees
      const tasks = (data || []).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        group_id: t.group_id,
        due_date: t.due_date,
        status: t.status || "todo",
        // Backwards-compatible boolean
        is_complete: (t.status || "todo") === "completed",
        created_by: t.created_by,
        assignees: (t.assignees || []).map((a) => a.user_id),
      }));

      return { data: tasks, error: null };
    } catch (e) {
      return { data: [], error: e };
    }
  },
};
