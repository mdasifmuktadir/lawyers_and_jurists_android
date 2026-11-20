// app/legal-opinion/_layout.tsx
import { Stack } from "expo-router";

export default function LegalOpinionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Route: /legal-opinion */}
      <Stack.Screen name="index" options={{ title: "Digest Types" }} />

      {/* Route: /legal-opinion/opinion/[id] */}
      <Stack.Screen
        name="subType/[type]"
        options={{ title: "Digest Subtypes" }}
      />
      <Stack.Screen name="subtype_list/[subtype]" options={{ title: "list" }} />

      <Stack.Screen name="detail/[id]" options={{ title: "details" }} />
    </Stack>
  );
}
