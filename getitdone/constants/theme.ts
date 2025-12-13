import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  primary: "#6366f1", // Indigo 500
  primaryDark: "#4338ca", // Indigo 700
  primaryLight: "#818cf8", // Indigo 400
  secondary: "#ec4899", // Pink 500
  background: "#f8fafc", // Slate 50
  surface: "#ffffff",
  text: "#1e293b", // Slate 800
  textSecondary: "#64748b", // Slate 500
  textTertiary: "#94a3b8", // Slate 400
  success: "#10b981", // Emerald 500
  error: "#ef4444", // Red 500
  warning: "#f59e0b", // Amber 500
  border: "#e2e8f0", // Slate 200
  inputBg: "#f1f5f9", // Slate 100
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const FONTS = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
};

export const LAYOUT = {
  window: { width, height },
  isSmallDevice: width < 375,
};
