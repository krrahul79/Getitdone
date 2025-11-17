import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function FeedbackTypeChip({
  type,
  label,
  icon,
  selected,
  onPress,
}: {
  type: string;
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
      ]}
      onPress={onPress}
    >
      <FontAwesome5
        name={icon}
        size={16}
        color={selected ? "#fff" : "#2563eb"}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.chipText, selected && { color: "#fff" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestionRow}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </View>
  );
}

export default function HelpFeedbackScreen() {
  const router = useRouter();
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [message, setMessage] = useState("");

  const handleClose = () => router.back();
  const handleSubmit = () => {
    Alert.alert("Thank you!", "Your feedback has been sent.");
    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={26} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Feedback</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <SectionHeader title="Send us a message" />
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackPrompt}>What's on your mind?</Text>
          <View style={styles.chipRow}>
            <FeedbackTypeChip
              type="suggestion"
              label="Suggestion"
              icon="lightbulb"
              selected={feedbackType === "suggestion"}
              onPress={() => setFeedbackType("suggestion")}
            />
            <FeedbackTypeChip
              type="bug"
              label="Bug Report"
              icon="bug"
              selected={feedbackType === "bug"}
              onPress={() => setFeedbackType("bug")}
            />
            <FeedbackTypeChip
              type="question"
              label="Question"
              icon="question-circle"
              selected={feedbackType === "question"}
              onPress={() => setFeedbackType("question")}
            />
          </View>
          <TextInput
            style={styles.textarea}
            value={message}
            onChangeText={setMessage}
            placeholder="Please describe your issue or idea..."
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSubmit}>
            <Text style={styles.sendBtnText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
        <SectionHeader title="Frequently Asked Questions" />
        <View style={styles.faqCard}>
          <FaqItem
            question="How do I invite someone to a group?"
            answer="Go to your 'Groups' tab, tap on the group you want to share, and tap the 'Invite' button. You can then add a member by their email."
          />
          <FaqItem
            question="How do I reschedule a task?"
            answer="Tap on any task to open the 'Task Details' screen. From there, tap the 'Reschedule' button and pick a new due date from the calendar."
          />
          <FaqItem
            question="Can I be in more than one group?"
            answer="Yes! You can create and join as many groups as you like. Your 'Home' dashboard will show you all tasks assigned to you across all your groups."
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBtn: { width: 32, alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  sectionHeader: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
    textTransform: "uppercase",
    paddingHorizontal: 20,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  feedbackPrompt: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  chipSelected: { backgroundColor: "#2563eb" },
  chipUnselected: { backgroundColor: "#e5e7eb" },
  chipText: { fontSize: 15, color: "#2563eb", fontWeight: "600" },
  textarea: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    minHeight: 80,
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  sendBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqItem: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestion: { fontSize: 16, color: "#1f2937", fontWeight: "600" },
  faqAnswer: {
    fontSize: 15,
    color: "#6b7280",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
