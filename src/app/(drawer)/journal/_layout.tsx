// app/legal-opinion/_layout.tsx
import { Stack } from "expo-router";

export default function LegalOpinionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Route: /legal-opinion */}
      <Stack.Screen name="index" options={{ title: "Journal Years" }} />

      {/* Route: /legal-opinion/opinion/[id] */}
      <Stack.Screen
        name="month/[year]"
        options={{ title: "Journal Months By Year" }}
      />
      <Stack.Screen
        name="month_list/[month]"
        options={{ title: "Journals By Months" }}
      />

      <Stack.Screen name="detail/[id]" options={{ title: "details" }} />
    </Stack>
  );
}
