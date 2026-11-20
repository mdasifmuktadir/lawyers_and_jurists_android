import { Brand, Fonts } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  Text,
} from "react-native-paper";

import { lawyer_ci_url } from "@/config/apiUrls";

// Interface matching all returned case fields

export default function CasesByDivisionScreen() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { division } = useLocalSearchParams<{ division: string }>();

  const router = useRouter();

  const fetchCases = async () => {
    setLoading(true);
    setError(null);

    let url: string;

    if (division == "High Court Division") {
      url = `${lawyer_ci_url}high_court_division_json/`;
    } else {
      url = `${lawyer_ci_url}appellate_division_json/`;
    }
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: any = await response.json();
      setCases(data.data.cases);
    } catch (err: any) {
      setError(err.message || "Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCasePress = (id: number) => {
    // Navigates to case/detail/[id].tsx
    console.log("here is the case id", id);
    router.push({
      pathname: "/case/detail/[id]" as any,
      params: { id: id.toString() },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Brand.colors.primary} />
        <Text style={styles.loadingText}>Loading cases...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button
          mode="contained"
          onPress={fetchCases}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            activeOpacity={0.7}
            onPress={() => handleCasePress(item.id)}
          >
            <Card mode="outlined" style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.badgeRow}>
                  <Chip
                    compact
                    mode="outlined"
                    style={styles.badge}
                    textStyle={styles.badgeText}
                  >
                    {decode(item.court)}
                  </Chip>
                  <Chip
                    compact
                    mode="outlined"
                    style={styles.badge}
                    textStyle={styles.badgeText}
                  >
                    {decode(item.division)}
                  </Chip>
                  <Chip
                    compact
                    style={styles.yearBadge}
                    textStyle={styles.yearBadgeText}
                  >
                    {decode(item.case_year)}
                  </Chip>
                </View>

                <Divider style={styles.divider} />
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Case No: </Text>
                    {decode(item.case_no)}
                  </Text>

                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Citation: </Text>
                    {decode(item.citation)}
                  </Text>

                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Appellant: </Text>
                    {decode(item.appellant)}
                  </Text>

                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Respondent: </Text>
                    {decode(item.respondent)}
                  </Text>

                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Judge: </Text>
                    {decode(item.judge)}
                  </Text>

                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Advocate: </Text>
                    {decode(item.advocate)}
                  </Text>

                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Subject: </Text>
                    {decode(item.subject)}
                  </Text>

                  {item.delivery_date ? (
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Delivery Date: </Text>
                      {decode(item.delivery_date)}
                    </Text>
                  ) : null}
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No cases found for this division.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Brand.colors.surface,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: Brand.colors.background,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    marginBottom: 8,
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    borderColor: Brand.colors.primary,
    backgroundColor: Brand.colors.background,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.colors.primary,
  },
  yearBadge: {
    backgroundColor: Brand.colors.surface,
  },
  yearBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.colors.inkSoft,
  },
  detailsContainer: {
    paddingTop: 10,
    gap: 5,
  },
  divider: {
    backgroundColor: Brand.colors.border,
  },
  detailText: {
    fontSize: 14,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    lineHeight: 20,
  },
  label: {
    fontWeight: "600",
    color: Brand.colors.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Brand.colors.muted,
  },
  errorText: {
    fontSize: 15,
    color: Brand.colors.error,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: Brand.colors.muted,
    marginTop: 40,
    fontSize: 15,
  },
  retryButton: {
    backgroundColor: Brand.colors.ink,
    borderRadius: Brand.radius.medium,
  },
});
