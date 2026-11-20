import { Custom_API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Text,
} from "react-native-paper";

export interface LawCase {
  id: number;
  title: string;
  subject: string;
  relevant_section: string;
  relevant_law: string;
  case_year: string | number;
}

export default function LawsListScreen() {
  const [laws, setLaws] = useState<LawCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCases, setTotalCases] = useState<number>(0);

  // ScrollView reference to jump back to top on page change
  const scrollViewRef = useRef<ScrollView>(null);

  const { time } = useLocalSearchParams<{ time: string }>();
  const router = useRouter();

  const fetchLaws = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${Custom_API_BASE_URL}custom/v1/law-cases?date_range=${time || ""}&per_page=10&page=${page}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      setLaws(data.results || []);
      setTotalCases(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to fetch laws");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaws();
  }, [time, page]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleLawPress = (id: number) => {
    router.push({
      pathname: "/laws_of_bangladesh/detail/[id]" as any,
      params: { id: id.toString() },
    });
  };

  if (loading && laws.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Brand.colors.primary} />
        <Text style={styles.loadingText}>Loading laws...</Text>
      </View>
    );
  }

  if (error || (laws.length === 0 && !loading)) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || `No laws found for ${time || "selected period"}.`}
        </Text>
        {error ? (
          <Button
            mode="contained"
            onPress={fetchLaws}
            style={styles.retryButton}
          >
            Retry
          </Button>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Info */}
      <View style={styles.headingContainer}>
        <Text style={styles.eyebrow}>LAWS OF BANGLADESH</Text>
        <Text style={styles.heading}>
          {time ? `Decade: ${time}` : "All Law Cases"}
        </Text>
        {totalCases > 0 ? (
          <Text style={styles.subtext}>Total Records Found: {totalCases}</Text>
        ) : null}
        <View style={styles.headingRule} />
      </View>

      {/* List Container with loading overlay during page switches */}
      <View style={styles.listContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              animating={true}
              size="small"
              color={Brand.colors.primary}
            />
          </View>
        )}

        {laws.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.cardWrapper,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleLawPress(item.id)}
          >
            <Card mode="outlined" style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>{decode(item.title)}</Text>

                <Divider style={styles.divider} />

                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Subject: </Text>
                    {decode(item.subject)}
                  </Text>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Relevant Section: </Text>
                    {decode(item.relevant_section)}
                  </Text>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Relevant Law: </Text>
                    {decode(item.relevant_law)}
                  </Text>

                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Date: </Text>
                    {item.case_year}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.paginationButton,
              page === 1 && styles.paginationButtonDisabled,
              pressed && page > 1 && styles.paginationButtonPressed,
            ]}
            onPress={handlePrevPage}
            disabled={page === 1 || loading}
          >
            <Text
              style={[
                styles.paginationButtonText,
                page === 1 && styles.paginationButtonTextDisabled,
              ]}
            >
              ‹ Previous
            </Text>
          </Pressable>

          <View style={styles.pageInfo}>
            <Text style={styles.pageInfoText}>
              Page {page} of {totalPages}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.paginationButton,
              page === totalPages && styles.paginationButtonDisabled,
              pressed && page < totalPages && styles.paginationButtonPressed,
            ]}
            onPress={handleNextPage}
            disabled={page === totalPages || loading}
          >
            <Text
              style={[
                styles.paginationButtonText,
                page === totalPages && styles.paginationButtonTextDisabled,
              ]}
            >
              Next ›
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.surface,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Brand.colors.surface,
  },
  headingContainer: {
    padding: 22,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium || 8,
    marginBottom: 16,
  },
  eyebrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 24,
    fontWeight: "600",
  },
  subtext: {
    color: Brand.colors.muted,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    marginTop: 4,
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 12,
  },
  listContainer: {
    gap: 12,
    position: "relative",
  },
  loadingOverlay: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
  },
  cardPressed: {
    opacity: 0.85,
  },
  card: {
    backgroundColor: Brand.colors.background,
    borderRadius: Brand.radius.medium,
    borderColor: Brand.colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    marginBottom: 8,
  },
  detailsContainer: {
    paddingTop: 8,
    gap: 4,
  },
  divider: {
    backgroundColor: Brand.colors.border,
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
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
  retryButton: {
    backgroundColor: Brand.colors.ink,
    borderRadius: Brand.radius.medium,
  },

  /* Pagination Bar Styles */
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.primary,
    borderRadius: Brand.radius.medium || 8,
  },
  paginationButtonPressed: {
    opacity: 0.7,
    backgroundColor: "#FAF6F0",
  },
  paginationButtonDisabled: {
    borderColor: Brand.colors.border,
    backgroundColor: "transparent",
  },
  paginationButtonText: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: "600",
  },
  paginationButtonTextDisabled: {
    color: Brand.colors.muted,
  },
  pageInfo: {
    alignItems: "center",
  },
  pageInfoText: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: "600",
  },
});
