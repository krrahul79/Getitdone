import { createClient } from "@supabase/supabase-js";
import * as Application from "expo-application";
import { Platform } from "react-native";

// Note: If using expo-constants or react-native-dotenv, adjust imports accordingly.
const supabaseUrl =
  process.env.SUPABASE_URL || "https://qcycnbdjuomiavaxtror.supabase.co";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_OFLFnePMjRZPLry8X-_lIA_euNl1gK7";

// Safety check
if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "https://qcycnbdjuomiavaxtror.supabase.co"
) {
  console.warn("Supabase keys are missing! Check your .env file.");
}

// --- DEVICE ID ---
let deviceIdCache = null;

const getDeviceId = async () => {
  if (deviceIdCache) return deviceIdCache;
  let deviceId;
  if (Platform.OS === "android") {
    deviceId = Application.androidId;
  } else {
    deviceId = await Application.getIosIdForVendorAsync();
  }
  deviceIdCache = deviceId;
  return deviceId;
};

// --- Supabase client with custom header ---
const getSupabaseClient = async () => {
  const deviceId = await getDeviceId();
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-device-id": deviceId,
      },
    },
  });
};

export const SupabaseService = {
  // --- INITIALIZATION (The "Lazy Login") ---
  // Call this in your root _layout.tsx or App.js on load
  async initializeUser(fullName = "Guest") {
    try {
      const supabase = await getSupabaseClient();
      const deviceId = await getDeviceId();
      if (!deviceId) throw new Error("Could not fetch device ID");

      // 1. Try to find an existing profile for this device
      let { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("device_id", deviceId)
        .maybeSingle(); // Use maybeSingle to avoid error if not found

      if (error) throw error;

      // 2. If no profile exists, CREATE one
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              device_id: deviceId,
              full_name: fullName,
              avatar_url: null,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      }

      return { data: profile, error: null };
    } catch (e) {
      console.error("Init Error:", e);
      return { data: null, error: e };
    }
  },

  // Get the current profile (wraps the logic above without creating)
  async getCurrentUser() {
    const deviceId = await getDeviceId();
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("device_id", deviceId)
      .single();
    return { user: data, profile: data, error };
    // Returning 'user' key to maintain compatibility with your existing UI code
  },

  // --- PROFILE UPDATES ---
  async updateProfile(updates) {
    const deviceId = await getDeviceId();
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("device_id", deviceId) // Find by Device ID
      .select()
      .single();

    return { data, error };
  },

  // --- STORAGE (Profile Pictures) ---
  async uploadAvatar(uri) {
    const deviceId = await getDeviceId();

    // Get the profile first to get the UUID (for cleaner file paths)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("device_id", deviceId)
      .single();

    if (!profile) return { error: "Profile not found" };

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = "png";
      // Save to: profile_uuid/timestamp.png
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      return { publicUrl: urlData.publicUrl, error: null };
    } catch (error) {
      return { publicUrl: null, error };
    }
  },

  // --- NOTIFICATIONS ---
  async registerPushToken(token, platform) {
    const deviceId = await getDeviceId();

    // Get Profile UUID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("device_id", deviceId)
      .single();

    if (!profile) return;

    const { error } = await supabase.from("user_push_tokens").upsert(
      {
        user_id: profile.id, // Link to Profile UUID
        token: token,
        platform: platform,
      },
      { onConflict: "user_id, token" }
    );

    if (error) console.error("Error registering token:", error);
  },

  // --- GROUPS ---
  async getMyGroups() {
    const deviceId = await getDeviceId();
    const supabase = await getSupabaseClient(); // Ensure supabase is initialized
    // Get Profile UUID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("device_id", deviceId)
      .single();

    if (!profile) return { data: [], error: "No profile" };

    // Fetch groups where this profile is a member
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
        id, name, icon, color,
        group_members!inner (user_id)
      `
      )
      .eq("group_members.user_id", profile.id);

    return { data, error };
  },

  async createGroup(name, icon, color) {
    const deviceId = await getDeviceId();

    // Get Profile UUID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("device_id", deviceId)
      .single();

    if (!profile) return { error: "Profile not found" };

    // 1. Create Group
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .insert([
        {
          name,
          icon,
          color,
          created_by: profile.id,
        },
      ])
      .select()
      .single();

    if (groupError) return { error: groupError };

    // 2. Add Creator as Admin Member
    const { error: memberError } = await supabase.from("group_members").insert([
      {
        group_id: groupData.id,
        user_id: profile.id,
        is_admin: true,
      },
    ]);

    return { data: groupData, error: memberError };
  },

  // NEW: Join a group by ID (For the husband/partner)
  async joinGroup(groupId) {
    const deviceId = await getDeviceId();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("device_id", deviceId)
      .single();

    if (!profile) return { error: "Profile not found" };

    const { error } = await supabase
      .from("group_members")
      .insert([{ group_id: groupId, user_id: profile.id }]);

    return { error };
  },

  // --- TASKS ---
  async getGroupTasks(groupId) {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        assignees:task_assignees(user_id)
      `
      )
      .eq("group_id", groupId)
      .order("due_date", { ascending: true });
    return { data, error };
  },

  async createTask(taskData) {
    const deviceId = await getDeviceId();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("device_id", deviceId)
      .single();

    // 1. Insert Task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert([
        {
          title: taskData.title,
          description: taskData.description,
          group_id: taskData.group_id,
          due_date: taskData.due_date,
          created_by: profile.id, // Link to Profile
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

  // --- ACTIVITY FEED ---
  async getActivityFeed() {
    const { data, error } = await supabase
      .from("activity_logs")
      .select(
        `
        *,
        actor:profiles(full_name),
        group:groups(name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50);
    return { data, error };
  },
};
