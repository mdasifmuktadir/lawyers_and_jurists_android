import { Custom_API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";

// Define the API response interface
interface FetchDatesResponse {
  dates: string[];
}

export default function JournalMonthsScreen() {
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const router = useRouter();

  const fetchDates = async () => {
    setLoading(true);
    setError(null);

    console.log("selected id:", id);
    console.log("selected name:", name);

    let url: string;

    let year: number = parseInt(name);

    if (year < 2017) {
      console.log("selected id is less than 2017");

      url =
        Custom_API_BASE_URL +
        `custom/v1/law-categories/subcategories?parent_id=${id}`;

      console.log("defined url is:", url);
    } else {
      url = Custom_API_BASE_URL + `custom/v1/journal-categories?name=${name}`;
    }

    console.log("selected url");
    console.log("selected url:", url);

    try {
      // Replace with your actual backend endpoint URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: any = await response.json();
      console.log("Fetched dates:", data); // Debugging log

      if (year < 2017) {
        setDates(data.results);
      } else {
        setDates(data.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch dates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleDatePress = (item: any) => {
    // Navigates to the route list-by-time/[time].tsx
    router.push({
      pathname: "journal/month_list/[id]" as any,
      params: { id: item.id },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A27440" />
        <Text style={styles.loadingText}>Loading dates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button
          mode="contained"
          onPress={fetchDates}
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
        data={dates}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            activeOpacity={0.7}
            onPress={() => handleDatePress(item)}
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
          <Text style={styles.emptyText}>No dates found.</Text>
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
