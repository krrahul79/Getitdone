import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image 
                  source={require("../assets/images/icon.png")} 
                  style={{ width: "100%", height: "100%", borderRadius: 24 }}
                  resizeMode="contain"
                />
              </View>
              {/* Badge removed - looks cleaner with just the logo */}
            </View>
            
            <Text style={styles.title}>FairShare</Text>
            <Text style={styles.subtitle}>
              Effortless harmony for your shared home.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.9}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <FontAwesome name="arrow-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              Simple. Collaborative. Beautiful.
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: SPACING.xl,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: SPACING.xl,
    position: "relative",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ rotate: "-5deg" }],
  },
  logoBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 42,
    color: "#fff",
    textAlign: "center",
    marginBottom: SPACING.s,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    maxWidth: width * 0.8,
    lineHeight: 26,
  },
  bottomSection: {
    paddingBottom: SPACING.xl,
    gap: SPACING.l,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: SPACING.l,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    ...SHADOWS.large,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
});
