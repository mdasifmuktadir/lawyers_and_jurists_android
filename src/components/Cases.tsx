import { Brand, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { decode } from "html-entities";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

const caseOptions: {
  label: string;
  route?: string;
  division?: string;
}[] = [
  { label: "Laws of Bangladesh", route: "/laws_of_bangladesh" },
  { label: "Appellate Division", division: "Appellate Division" },
  { label: "High Court Division", division: "High Court Division" },
  { label: "Digest", route: "/digest" },
  { label: "Monthly Journals", route: "/journal" },
] as const;

export default function Cases() {
  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.eyebrow}>RESEARCH & RESOURCES</Text>
        <Text style={styles.heading}>Case Management</Text>
        <View style={styles.headingRule} />
      </View>

      <View style={styles.content}>
        {caseOptions.map((option, index) => (
          <Pressable
            key={option.label}
            style={({ pressed }) => [
              styles.caseRow,
              pressed && styles.caseRowPressed,
            ]}
            onPress={() => {
              if (option.division) {
                router.push({
                  pathname: "/case/list_by_division/[division]" as any,
                  params: { division: encodeURIComponent(option.division) },
                });
                return;
              }

              router.push(option.route as any);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${option.label}`}
          >
            <Text style={styles.caseNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.caseLabel}>{decode(option.label)}</Text>
            <Text style={styles.caseArrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 24,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  eyebrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  content: {
    gap: 10,
  },
  headingContainer: {
    marginBottom: 18,
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 12,
  },
  caseRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.surface,
  },
  caseRowPressed: {
    opacity: 0.72,
  },
  caseNumber: {
    width: 34,
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 17,
  },
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    fontWeight: "600",
  },
  caseLabel: {
    flex: 1,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  caseArrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    lineHeight: 30,
  },
});
