import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

import { SupabaseService } from "../../services/supabaseService";
import { useProfile } from "../ProfileContext";
import { useToast } from "../../context/ToastContext";

function FormInput({
  label,
  value,
  onChangeText,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  [key: string]: any;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const { showToast } = useToast();
  
  const [name, setName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [avatar, setAvatar] = useState(profile?.avatar_url || null);
  const [avatarChars, setAvatarChars] = useState(profile?.full_name?.[0] || "?");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = avatar;
      
      // If avatar is a local file uri, upload it
      if (avatar && !avatar.startsWith('http')) {
          const { publicUrl, error: uploadError } = await SupabaseService.uploadAvatar(avatar);
          if (uploadError) throw uploadError;
          avatarUrl = publicUrl;
      }

      const updates = {
          full_name: name,
          avatar_url: avatarUrl,
      };

      const { data, error } = await SupabaseService.updateProfile(updates);

      if (error) throw error;
      
      // Update local context
      if (profile) {
          setProfile({ ...profile, ...updates });
      }

      showToast("Success", "Profile updated successfully!", "success");
      router.back();
    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => router.back();

  const handleChangePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       allowsEditing: true,
       aspect: [1, 1],
       quality: 0.5,
    });

    if (pickerResult.canceled === true) {
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0) {
        setAvatar(pickerResult.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={26} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={loading}>
          <Text style={[styles.headerSave, loading && { color: '#9ca3af' }]}>
              {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Form Body */}
      <View style={styles.formBody}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
               {avatar ? (
                   <Image source={{ uri: avatar }} style={styles.avatarImage} />
               ) : (
                  <Text style={styles.avatarText}>{avatarChars}</Text>
               )}
            </View>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handleChangePicture}
            >
              <FontAwesome5 name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <FormInput
          label="Name"
          value={name}
          onChangeText={(text) => {
              setName(text);
              if(text.length > 0) setAvatarChars(text[0]);
          }}
          placeholder="e.g., Alex"
        />
        <View style={{ marginBottom: 18 }}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
                style={[styles.input, { backgroundColor: '#f3f4f6', color: '#9ca3af' }]}
                value={email}
                editable={false}
            />
            <Text style={styles.helperText}>Email cannot be changed.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerSave: { fontSize: 16, fontWeight: "600", color: "#2563eb" },
  formBody: { flex: 1, padding: 24 },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarWrap: { position: "relative", alignItems: "center" },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: { color: "#2563eb", fontWeight: "700", fontSize: 56 },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563eb",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
});
