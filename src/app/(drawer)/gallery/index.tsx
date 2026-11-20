import { API_BASE_URL } from "@/config/apiUrls";
import axios from "axios";
import { useRouter } from "expo-router";
import { decode } from "html-entities";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

const { width } = Dimensions.get("window");

export default function GalleryScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const endpoint = `${API_BASE_URL}gallery?_fields=id,title,featured_image`;
      const response = await axios.get<any[]>(endpoint);

      // Filter out items that do not have a valid featured image URL
      const validData = response.data.filter(
        (item) => item.featured_image?.url,
      );

      setCategories(validData);
    } catch (err) {
      setError("Failed to load gallery categories.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryPress = (id: string) => {
    // Navigate to dynamic route passing the category parameter
    router.push({
      pathname: "/gallery/[id]" as any,
      params: { id: id },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A27440" />
        <Text style={styles.loadingText}>Loading Gallery...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchCategories();
          }}
        />
      }
    >
      {categories.map((item) => (
        <Pressable
          key={item.id}
          style={styles.card}
          onPress={() => handleCategoryPress(item.id)}
        >
          <Image
            source={{ uri: item.featured_image.url }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Text style={styles.categoryTitle}>
              {decode(
                item.title?.rendered
                  ? item.title.rendered.replace("_", " ")
                  : "",
              )}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  scrollContent: { paddingBottom: 20 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#888" },
  errorText: { fontSize: 15, color: "#c62828", textAlign: "center" },
  card: {
    width: width,
    height: 240,
    marginBottom: 12,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: 16,
  },
  categoryTitle: {
    color: "#A27440",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
});
