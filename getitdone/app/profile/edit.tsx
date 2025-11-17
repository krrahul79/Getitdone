import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const MOCK_USER = {
  id: "user123",
  name: "Alex",
  email: "alex@example.com",
  avatar: "A",
};

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
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [avatar, setAvatar] = useState(MOCK_USER.avatar);

  const handleSave = () => {
    Alert.alert("Profile saved", "Profile saved successfully!");
    router.back();
  };
  const handleClose = () => router.back();
  const handleChangePicture = () =>
    Alert.alert("Change Picture", "This would open the device's image picker.");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={26} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <Text style={styles.headerSave}>Save</Text>
        </TouchableOpacity>
      </View>
      {/* Form Body */}
      <View style={styles.formBody}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatar}</Text>
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
          onChangeText={setName}
          placeholder="e.g., Alex"
        />
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g., alex@example.com"
          keyboardType="email-address"
        />
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
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBtn: { width: 48, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  headerSave: { fontSize: 18, fontWeight: "700", color: "#2563eb" },
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
  },
  avatarText: { color: "#2563eb", fontWeight: "700", fontSize: 56 },
  cameraBtn: {
    position: "absolute",
    bottom: 8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
