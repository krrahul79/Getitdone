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

  async logActivity({ group_id, action_type, target_name, metadata }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("activity_logs").insert([
      {
        group_id,
        actor_id: user.id,
        action_type,
        target_name,
        metadata,
      },
    ]);

    if (error) {
      console.error("Error logging activity:", error);
    }
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not logged in" };

    try {
        // 1. Get IDs of groups the user belongs to
        const { data: memberships, error: memberError } = await supabase
            .from("group_members")
            .select("group_id")
            .eq("user_id", user.id);
        
        if (memberError) return { data: [], error: memberError };
        
        const myGroupIds = (memberships || []).map(m => m.group_id);

        if (myGroupIds.length === 0) {
            return { data: [], error: null };
        }

        // 2. Fetch groups with member count using the IDs
        const { data: groups, error: groupsError } = await supabase
            .from("groups")
            .select(`
                id, name, icon, color, join_code,
                group_members(count)
            `)
            .in("id", myGroupIds);

        if (groupsError) return { data: [], error: groupsError };

        // 3. Transform to provide _count.members for the UI
        // Supabase returns group_members as [{ count: N }] when using (count)
        const transformedData = groups.map(g => ({
            ...g,
            _count: { 
                members: g.group_members && g.group_members[0] ? g.group_members[0].count : 0 
            }
        }));

        return { data: transformedData, error: null };
    } catch (e) {
        return { data: [], error: e };
    }
  },

  async joinGroupByCode(code) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    const normalizedCode = code.trim().toUpperCase();
    console.log(`[SupabaseService] Joining group with code: ${normalizedCode}`);

    // 1. Find Group
    const { data: group, error: searchError } = await supabase
      .from("groups")
      .select("id")
      .eq("join_code", normalizedCode)
      .single();

    if (searchError || !group) {
        console.log("[SupabaseService] Group not found for code:", normalizedCode);
        return { error: "Group not found. Check the code and try again." };
    }

    // 2. Check if already a member (to give better feedback)
    const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();
    
    if (existingMember) {
        return { error: "You are already a member of this group." };
    }

    // 3. Join
    const { error: joinError } = await supabase
      .from("group_members")
      .insert([{ group_id: group.id, user_id: user.id }]);

    if (joinError) {
        console.error("[SupabaseService] Join error:", joinError);
        return { error: "Failed to join group. Please try again." };
    }

    return { error: null };
  },

  async updateGroup(groupId, updates) {
    const { data, error } = await supabase
      .from("groups")
      .update(updates)
      .eq("id", groupId)
      .select()
      .single();
    return { data, error };
  },

  async leaveGroup(groupId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);
    return { error };
  },

  async deleteGroup(groupId) {
    // RLS should handle allowing this only for creators/admins
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    return { error };
  },

  // --- TASKS ---
  async getGroupTasks(groupId) {
    const { data, error } = await supabase
      .from("tasks")
      // include assignees and their profile info from task_assignees -> profiles
      .select(
        "id, title, description, group_id, due_date, is_completed, created_by, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url))"
      )
      .eq("group_id", groupId)
      .order("due_date", { ascending: true });

    if (error) return { data: [], error };

    // Normalize assignees: provide simple user_id array and optional profile objects
    const tasks = (data || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      group_id: t.group_id,
      due_date: t.due_date,
      is_completed: !!t.is_completed,
      created_by: t.created_by,
      assignees: (t.assignees || []).map((a) => a.user_id),
      assignee_profiles: (t.assignees || [])
        .map((a) => a.profiles)
        .filter(Boolean),
    }));

    return { data: tasks, error: null };
  },

  async getTask(taskId) {
    const { data: task, error } = await supabase
      .from("tasks")
      .select(
        "id, title, description, group_id, due_date, is_completed, created_by, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url)), group:groups(name)"
      )
      .eq("id", taskId)
      .single();

    if (error) return { data: null, error };

    const result = {
      id: task.id,
      title: task.title,
      description: task.description,
      group_id: task.group_id,
      groupName: task.group?.name,
      due_date: task.due_date,
      is_completed: !!task.is_completed,
      created_by: task.created_by,
      assignees: (task.assignees || []).map((a) => a.user_id),
      assignee_profiles: (task.assignees || [])
        .map((a) => a.profiles)
        .filter(Boolean),
    };

    return { data: result, error: null };
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

    // 2. Insert/Upsert Assignees (avoid duplicate PK errors)
    if (taskData.assignees && taskData.assignees.length > 0) {
      const assigneeRows = taskData.assignees.map((uid) => ({
        task_id: task.id,
        user_id: uid,
      }));
      // insert assignees for the new task; check for errors so we don't silently continue
      const { data: assigneeData, error: assigneeError } = await supabase
        .from("task_assignees")
        .insert(assigneeRows);
      if (assigneeError) {
        console.error("task_assignees insert error:", assigneeError);
        return { data: null, error: assigneeError };
      }
    }

    // 3. Re-query the task including assignees + profile info
    const { data: fullTask, error: fullTaskError } = await supabase
      .from("tasks")
      .select(
        "id, title, description, group_id, due_date, is_completed, created_by, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url))"
      )
      .eq("id", task.id)
      .single();

    if (fullTaskError) return { data: null, error: fullTaskError };

    const result = {
      id: fullTask.id,
      title: fullTask.title,
      description: fullTask.description,
      group_id: fullTask.group_id,
      due_date: fullTask.due_date,
      is_completed: !!fullTask.is_completed,
      created_by: fullTask.created_by,
      assignees: (fullTask.assignees || []).map((a) => a.user_id),
      assignee_profiles: (fullTask.assignees || [])
        .map((a) => a.profiles)
        .filter(Boolean),
    };

    return { data: result, error: null };
  },

  async updateTaskStatus(taskId, status) {
    const isCompleted = !!status;
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_completed: isCompleted })
      .eq("id", taskId)
      .select(
        "id, title, description, group_id, due_date, is_completed, created_by, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url))"
      )
      .single();

    if (error) return { data: null, error };

    const res = {
      id: data.id,
      title: data.title,
      description: data.description,
      group_id: data.group_id,
      due_date: data.due_date,
      is_completed: !!data.is_completed,
      created_by: data.created_by,
      assignees: (data.assignees || []).map((a) => a.user_id),
      assignee_profiles: (data.assignees || [])
        .map((a) => a.profiles)
        .filter(Boolean),
    };

    return { data: res, error: null };
  },

  async updateTaskDetails(taskId, updates, assigneeIds) {
    // 1. Update basic fields
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        title: updates.title,
        description: updates.description,
      })
      .eq("id", taskId);

    if (updateError) return { error: updateError };

    // 2. Sync Assignees if provided
    if (assigneeIds && Array.isArray(assigneeIds)) {
      console.log(`[SupabaseService] Updating assignees for task ${taskId}`, assigneeIds);
      
      // Fetch current assignees
      const { data: currentAssignees, error: fetchError } = await supabase
        .from("task_assignees")
        .select("user_id")
        .eq("task_id", taskId);
        
      if (fetchError) {
        console.error("[SupabaseService] Error fetching assignees:", fetchError);
        return { error: fetchError };
      }

      const currentIds = (currentAssignees || []).map(a => a.user_id);
      
      // Determine to add
      const toAdd = assigneeIds.filter(id => !currentIds.includes(id));
      // Determine to remove
      const toRemove = currentIds.filter(id => !assigneeIds.includes(id));

      console.log(`[SupabaseService] Adding assignees:`, toAdd);
      console.log(`[SupabaseService] Removing assignees:`, toRemove);

      if (toAdd.length > 0) {
          const { error: addError } = await supabase.from("task_assignees").insert(
            toAdd.map(uid => ({ task_id: taskId, user_id: uid }))
          );
          if (addError) {
            console.error("[SupabaseService] Error adding assignees:", addError);
            return { error: addError };
          }
      }
      
      if (toRemove.length > 0) {
          const { error: removeError } = await supabase.from("task_assignees").delete()
            .eq("task_id", taskId)
            .in("user_id", toRemove);
          if (removeError) {
            console.error("[SupabaseService] Error removing assignees:", removeError);
            return { error: removeError };
          }
      }
    }

    // 3. Return updated task
    return this.getTask(taskId);
  },

  async rescheduleTask(taskId, newDate) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ due_date: newDate })
      .eq("id", taskId)
      .select(
        "id, title, description, group_id, due_date, is_completed, created_by, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url))"
      )
      .single();

    if (error) return { data: null, error };

    const res = {
      id: data.id,
      title: data.title,
      description: data.description,
      group_id: data.group_id,
      due_date: data.due_date,
      is_completed: !!data.is_completed,
      created_by: data.created_by,
      assignees: (data.assignees || []).map((a) => a.user_id),
      assignee_profiles: (data.assignees || [])
        .map((a) => a.profiles)
        .filter(Boolean),
    };

    // Log Activity
    await this.logActivity({
      group_id: res.group_id,
      action_type: "RESCHEDULE_TASK",
      target_name: res.title,
      metadata: { new_date: newDate },
    });

    return { data: res, error: null };
  },

  async deleteTask(taskId) {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    return { error };
  },

  // helpers: assign/remove users on a task
  async assignUsersToTask(taskId, userIds = []) {
    if (!taskId || !Array.isArray(userIds) || userIds.length === 0)
      return { error: null };

    const rows = userIds.map((uid) => ({ task_id: taskId, user_id: uid }));
    // upsert to avoid primary key conflicts
    const { error } = await supabase.from("task_assignees").upsert(rows);
    if (error) return { error };

    // return updated task
    const { data, error: requeryError } = await supabase
      .from("tasks")
      .select(
        "id, title, description, group_id, due_date, is_completed, created_by, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url))"
      )
      .eq("id", taskId)
      .single();

    if (requeryError) return { data: null, error: requeryError };

    return {
      data: {
        id: data.id,
        assignees: (data.assignees || []).map((a) => a.user_id),
        assignee_profiles: (data.assignees || [])
          .map((a) => a.profiles)
          .filter(Boolean),
      },
      error: null,
    };
  },

  async removeTaskAssignee(taskId, userId) {
    const { error } = await supabase
      .from("task_assignees")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", userId);

    if (error) return { error };

    const { data, error: requeryError } = await supabase
      .from("tasks")
      .select(
        "id, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url))"
      )
      .eq("id", taskId)
      .single();

    if (requeryError) return { data: null, error: requeryError };

    return {
      data: {
        id: data.id,
        assignees: (data.assignees || []).map((a) => a.user_id),
        assignee_profiles: (data.assignees || [])
          .map((a) => a.profiles)
          .filter(Boolean),
      },
      error: null,
    };
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
        .select("id, name, icon, color, join_code, created_by, created_at")
        .eq("id", groupId)
        .maybeSingle();
      
      if (groupError) return { error: groupError };
      if (!group) return { error: { message: "Group not found" } };

      const { data: members, error: membersError } = await supabase
        .from("group_members")
        .select("user_id, is_admin, profiles(id, full_name, avatar_url)")
        .eq("group_id", groupId);
      if (membersError) return { error: membersError };

      // Map members to a clean structure
      const mappedMembers = (members || []).map((m) => ({
        id: m.profiles?.id || m.user_id,
        full_name: m.profiles?.full_name || "Unknown",
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
      // 1. Get IDs of tasks assigned to the user
      const { data: assignments, error: assignmentError } = await supabase
        .from("task_assignees")
        .select("task_id")
        .eq("user_id", user.id);
      console.log("[SupabaseService] Assignments:", assignments);
      if (assignmentError) return { data: [], error: assignmentError };
      
      const taskIds = (assignments || []).map(a => a.task_id);
      
      if (taskIds.length === 0) {
        return { data: [], error: null };
      }

      // 2. Fetch the actual tasks
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id, title, description, group_id, due_date, is_completed, created_by, assignees:task_assignees(user_id, profiles(id, full_name, avatar_url)), group:groups(name)"
        )
        .in("id", taskIds)
        .order("due_date", { ascending: true });
      console.log("[SupabaseService] Tasks:", data);
      if (error) return { data: [], error };

      // normalize assignees and keep DB boolean is_completed
      const tasks = (data || []).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        group_id: t.group_id,
        groupName: t.group?.name,
        due_date: t.due_date,
        is_completed: !!t.is_completed,
        created_by: t.created_by,
        assignees: (t.assignees || []).map((a) => a.user_id),
        assignee_profiles: (t.assignees || [])
          .map((a) => a.profiles)
          .filter(Boolean),
      }));

      return { data: tasks, error: null };
    } catch (e) {
      return { data: [], error: e };
    }
  },

  async registerPushToken(token) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not logged in" };

    const { error } = await supabase
      .from("user_push_tokens")
      .upsert({ user_id: user.id, token }, { onConflict: "token" });

    return { error };
  },
  async uploadAvatar(localUri) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // 1. Read file as base64 (Expo FileSystem)
      // Note: Supabase JS v2 supports uploading from ArrayBuffer/Blob/File. 
      // In React Native/Expo, we can use FormData or ArrayBuffer.
      // However, the simplest cross-platform way in Expo often involves `fetch` to get the blob.
      
      const response = await fetch(localUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const fileExt = localUri.split(".").pop().toLowerCase();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return { publicUrl: data.publicUrl, error: null };
    } catch (e) {
      console.error("Upload Avatar Error:", e);
      return { publicUrl: null, error: e };
    }
  },

  async getProfileStats() {
    const {
        data: { user },
      } = await supabase.auth.getUser();
    if (!user) return { tasksDone: 0, groupsCount: 0 };
    
    try {
        // Groups count
        const { count: groupsCount } = await supabase
            .from("group_members")
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // Tasks Done (assigned to user and completed)
        // We can do this by selecting from task_assignees and joining tasks
        const { data: assignedTasks } = await supabase
            .from('task_assignees')
            .select('task_id, tasks!inner(is_completed)')
            .eq('user_id', user.id)
            .eq('tasks.is_completed', true);
            
        const tasksDone = assignedTasks ? assignedTasks.length : 0;

        return { 
            groupsCount: groupsCount || 0,
            tasksDone: tasksDone
        };
    } catch(e) {
        console.error("Stats error", e);
        return { groupsCount: 0, tasksDone: 0 };
    }
  }
};
