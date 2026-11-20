// app/legal-opinion/_layout.tsx
import { Stack } from "expo-router";

export default function LegalOpinionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Route: /legal-opinion */}
      <Stack.Screen name="index" options={{ title: "Legal Opinions" }} />

      {/* Route: /legal-opinion/opinion/[id] */}
      <Stack.Screen
        name="opinion/[id]"
        options={{ title: "Opinion Details" }}
      />
    </Stack>
  );
}
