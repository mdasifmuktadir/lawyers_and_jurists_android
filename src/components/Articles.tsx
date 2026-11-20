import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { router } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function Articles() {
  const [response, setResponses] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 2. Set up an AbortController to cancel requests if component unmounts mid-fetch
    const source = axios.CancelToken.source();

    async function fetchArticles() {
      try {
        // 3. Make the API call using Axios
        const response = await axios.get(
          `${API_BASE_URL}articlecat?_fields=name,id,title&per_page=20`,
          {
            cancelToken: source.token,
          },
        );

        // Axios stores parsed JSON data inside the '.data' property automatically
        setResponses(response.data);
      } catch (err: any) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
          // Axios wraps errors intuitively; fallback to standard message strings
          setError(
            err.response?.data?.message ||
              err.message ||
              "Something went wrong",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();

    // Cleanup token function executed if user leaves screen before API resolves
    return () => {
      source.cancel("Component unmounted, canceling API call.");
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading publications...</Text>
      </View>
    );
  }

  if (error || !response || response.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No publications found."}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.eyebrow}>KNOWLEDGE CENTRE</Text>
        <Text style={styles.heading}>Articles, Journals & Reports</Text>
        <View style={styles.headingRule} />
      </View>

      <View style={styles.content}>
        {response.map((category, index) => (
          <Pressable
            key={category.id}
            style={({ pressed }) => [
              styles.listItem,
              pressed && styles.listItemPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/articles/[category]" as any,
                params: { category: category.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Browse ${category.name}`}
          >
            <Text style={styles.categoryNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.categoryTitle}>{decode(category.name)}</Text>
            <Text style={styles.categoryArrow}>›</Text>
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
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 12,
  },
  content: {
    gap: 10,
  },
  headingContainer: {
    marginBottom: 18,
  },
  carouselContainer: {
    minHeight: 180,
    width: "100%",
    backgroundColor: Brand.colors.surface,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 27,
    fontWeight: "600",
  },
  listItem: {
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
  listItemPressed: {
    opacity: 0.72,
  },
  categoryNumber: {
    width: 34,
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 17,
  },
  categoryTitle: {
    flex: 1,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  categoryArrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    lineHeight: 30,
  },
  stateText: {
    marginTop: 10,
    color: Brand.colors.muted,
  },
  errorText: {
    color: Brand.colors.error,
    textAlign: "center",
  },
});
