// app/legal-opinion/_layout.tsx
import { Stack } from "expo-router";

export default function LegalOpinionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Route: /litigations */}

      {/* Route: /litigations/litigation/[id] */}
      <Stack.Screen
        name="litigations/litigation_detail/[id]"
        options={{ title: "Litigation Details" }}
      />

      <Stack.Screen
        name="litigation_list/[category]"
        options={{ title: "Litigation List" }}
      />
    </Stack>
  );
}
