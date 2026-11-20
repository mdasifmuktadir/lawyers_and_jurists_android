// app/legal-opinion/_layout.tsx
import { Stack } from "expo-router";

export default function LegalOpinionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Route: /legal-opinion */}
      <Stack.Screen name="index" options={{ title: "Documentations" }} />

      {/* Route: /legal-opinion/opinion/[id] */}

      <Stack.Screen
        name="detail/[id]"
        options={{ title: "Documentation  Detail" }}
      />
      <Stack.Screen
        name="list/[id]"
        options={{ title: "Documentation  Detail" }}
      />
    </Stack>
  );
}
