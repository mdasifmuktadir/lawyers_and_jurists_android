import { lawyer_ci_url } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { decode } from "html-entities";

// Define the API response interface

export default function SubtypeListScreen() {
  const [digestChilds, setDigestChilds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useLocalSearchParams<{ id: string }>();

  console.log("search param value of id");
  console.log(id);

  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual backend endpoint URL
      const response = await fetch(
        lawyer_ci_url + "digest_category_child_json/" + id,
      );

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: any = await response.json();
      console.log("Fetched dates:", data); // Debugging log
      setDigestChilds(data.data.digest_child_categories);
    } catch (err: any) {
      setError(err.message || "Failed to fetch dates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDataPress = (id: string) => {
    // Navigates to the route list-by-time/[time].tsx
    router.push({
      pathname: "digest/subtype_list/[id]" as any,
      params: { id: id },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Brand.colors.primary} />
        <Text style={styles.loadingText}>Loading dates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button mode="contained" onPress={fetchData} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={digestChilds}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            activeOpacity={0.7}
            onPress={() => handleDataPress(item.id)}
          >
            <Card mode="outlined" style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.dateNumber}>§</Text>
                <Text style={styles.dateText}>{decode(item.name)}</Text>
                <Text style={styles.dateArrow}>›</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No digest child categories found.
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
    marginBottom: 12,
  },
  card: {
    backgroundColor: Brand.colors.background,
    borderRadius: Brand.radius.medium,
    borderColor: Brand.colors.border,
  },
  cardContent: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  dateNumber: {
    width: 34,
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 20,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
  },
  dateArrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    lineHeight: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Brand.colors.muted,
  },
  errorText: {
    fontSize: 16,
    color: Brand.colors.error,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: Brand.colors.muted,
    marginTop: 40,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: Brand.colors.ink,
    borderRadius: Brand.radius.medium,
  },
});
