// app/legal-opinion/_layout.tsx
import { Stack } from "expo-router";

export default function LegalOpinionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Route: /legal-opinion */}
      <Stack.Screen name="[author]" options={{ title: "Books By Author" }} />

      {/* Route: /legal-opinion/opinion/[id] */}
      <Stack.Screen name="detail/[id]" options={{ title: "Book Details" }} />
    </Stack>
  );
}
