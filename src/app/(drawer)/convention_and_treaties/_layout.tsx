// app/legal-opinion/_layout.tsx
import { Stack } from "expo-router";

export default function ConventionAndTreatiesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Route: /convention_and_treaties */}
      <Stack.Screen
        name="[id]"
        options={{ title: "Conventions and Treaties by Type" }}
      />

      {/* Route: /convention_and_treaties/detail/[id] */}
      <Stack.Screen
        name="detail/[id]"
        options={{ title: "Conventions and Treaties Detail" }}
      />
    </Stack>
  );
}
