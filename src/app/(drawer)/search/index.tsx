import { initialSearchForm, SearchFormField } from "@/components/Drawer"; // Adjust path
import { useLocalSearchParams, useRouter } from "expo-router";
import { decode } from "html-entities";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL =
  "https://www.lawyersnjurists.com/lawyer_ci/frontend_controller/search_check_json";

type SearchParamsShape = Partial<Record<SearchFormField, string | string[]>>;

interface SearchResultItem {
  id?: string | number;
  title?: string;
  case_no?: string;
  subject?: string;
  court?: string;
  [key: string]: unknown;
}

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<SearchParamsShape>();
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Serialize params so the effect only re-runs when the actual search criteria change
  const paramsKey = JSON.stringify(params);

  const fetchSearchResults = useCallback(
    async (signal: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        // 1. Merge received route params with defaults
        const searchData = {
          ...initialSearchForm,
          ...params,
        };

        // 2. Encode state object into URLSearchParams (form-encoded)
        const formBody = new URLSearchParams();

        Object.entries(searchData).forEach(([key, value]) => {
          const strVal = String(value ?? "").trim();

          // ONLY append fields that actually have a value
          if (strVal !== "" && strVal !== "undefined" && strVal !== "null") {
            formBody.append(key, strVal);
          }
        });

        // 3. Make the POST request
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Accept: "application/json",
          },
          body: formBody.toString(),
          signal,
        });

        if (!response.ok) {
          throw new Error(`Server returned status code ${response.status}`);
        }

        // 4. Parse JSON payload — defensively handle non-array shapes
        const json = await response.json();
        const list: SearchResultItem[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.results)
            ? json.results
            : Array.isArray(json?.data)
              ? json.data
              : [];

        setResults(list);
      } catch (err: any) {
        if (err?.name === "AbortError") return; // fetch was cancelled, not a real error
        console.error("Search fetch error:", err);
        setError(err?.message || "Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    },
    [paramsKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSearchResults(controller.signal);
    return () => controller.abort();
  }, [fetchSearchResults]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Searching database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Found {results.length} Results</Text>
      <FlatList
        data={results}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.title} numberOfLines={2}>
                {decode(item.title) || decode(item.case_no) || "Untitled Case"}
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {decode(item.subject) || decode(item.court)}
              </Text>
            </View>

            {/* Navigation Button */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                if (item.id) {
                  router.push({
                    pathname: "/search/detail/[id]" as any,
                    params: { id: String(item.id) },
                  });
                }
              }}
            >
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No legal cases found matching your criteria.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  card: {
    padding: 14,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardContent: {
    flexDirection: "column", // Stack elements vertically
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  detailsButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyText: { textAlign: "center", color: "#666", marginTop: 20 },
});
