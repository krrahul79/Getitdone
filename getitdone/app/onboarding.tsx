import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { SupabaseService } from "../services/supabaseService";

const tutorialSteps = [
  {
    icon: "users",
    title: "1. Create Your Groups",
    description:
      "Start by creating groups for your family, household, or any project you share.",
    bgColor: "#3b82f6", // blue-500
  },
  {
    icon: "plus-circle",
    title: "2. Add & Assign Tasks",
    description:
      "Easily add tasks, set due dates, and assign them to one or more group members.",
    bgColor: "#6366f1", // indigo-500
  },
  {
    icon: "bell",
    title: "3. Get It Done!",
    description:
      "Get notified when a task is assigned to you, and feel the satisfaction of marking it complete.",
    bgColor: "#10b981", // emerald-500
  },
];

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // On mount, fetch profile name
    const fetchProfile = async () => {
      const { profile } = await SupabaseService.getCurrentUser();
      if (profile?.full_name && profile.full_name.trim()) {
        router.replace("/tabs/home");
      } else {
        setProfileName(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    // Reset animations when step changes
    titleAnim.setValue(0);
    descAnim.setValue(0);
    Animated.stagger(200, [
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(descAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  // Helper for animated style
  const animatedStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  });

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("/tabs/home");
    }
  };

  const handleSkip = () => {
    router.replace("/tabs/home");
  };

  // Step dots
  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {tutorialSteps.map((_, idx) => (
        <View
          key={idx}
          style={[styles.dot, currentStep === idx && styles.activeDot]}
        />
      ))}
    </View>
  );

  // Render loading state if fonts are not loaded
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Top Section: Skip Button */}
      <View style={styles.skipContainer}>
        {currentStep < tutorialSteps.length - 1 && (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
      {/* Slides */}
      <View style={styles.slidesWindow}>
        <View style={[styles.slide, { width }]}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: tutorialSteps[currentStep].bgColor },
            ]}
          >
            <FontAwesome
              name={tutorialSteps[currentStep].icon as any}
              size={48}
              color="#fff"
            />
          </View>
          <Animated.Text style={[styles.slideTitle, animatedStyle(titleAnim)]}>
            {tutorialSteps[currentStep].title}
          </Animated.Text>
          <Animated.Text style={[styles.slideDesc, animatedStyle(descAnim)]}>
            {tutorialSteps[currentStep].description}
          </Animated.Text>
        </View>
      </View>
      {/* Bottom Section: Dots & Button */}
      <View style={styles.bottomNav}>
        {renderDots()}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
      {/* Removed Name Modal */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipContainer: {
    height: 56,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#6b7280",
  },
  slidesWindow: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  slideTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
  },
  slideDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 8,
  },
  bottomNav: {
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d1d5db",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#2563eb",
    width: 24,
  },
  nextButton: {
    width: "100%",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  nextButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginBottom: 16,
    color: "#1f2937",
  },
  nameInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
});
