import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 88,
          position: "absolute",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = "home";
          if (route.name === "home") iconName = "home";
          else if (route.name === "groups") iconName = "users";
          else if (route.name === "activity") iconName = "pie-chart";
          else if (route.name === "profile") iconName = "user";
          return (
            <FontAwesome name={iconName as any} size={size} color={color} />
          );
        },
      })}
    >
      <Tabs.Screen name="home" options={{ tabBarLabel: "Home" }} />
      <Tabs.Screen name="groups" options={{ tabBarLabel: "Groups" }} />
      <Tabs.Screen name="activity" options={{ tabBarLabel: "Activity" }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
