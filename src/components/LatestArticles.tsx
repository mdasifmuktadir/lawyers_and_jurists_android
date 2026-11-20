import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { useRouter } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

// Updated interface to match WordPress REST API response
interface Article {
  id: number;
  title: {
    rendered: string;
  };
  date?: string;
}

export default function LatestArticles() {
  const router = useRouter();
  const [response, setResponses] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const source = axios.CancelToken.source();

    async function fetchArticles() {
      try {
        // Explicitly include 'date' in _fields so formatDate gets a valid ISO string
        const res = await axios.get<Article[]>(
          `https://www.lawyersnjurists.com/wp-json/wp/v2/article?_fields=id,title,date&per_page=5&orderby=date&order=desc`,
          {
            cancelToken: source.token,
          },
        );

        setResponses(res.data);
      } catch (err: any) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
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

    return () => {
      source.cancel("Component unmounted, canceling API call.");
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading latest articles...</Text>
      </View>
    );
  }

  if (error || response?.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No latest articles found."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>INSIGHTS & UPDATES</Text>
          <Text style={styles.heading}>Latest Articles</Text>
        </View>
        <View style={styles.headingRule} />
      </View>

      <View style={styles.articleList}>
        {response.map((item, index) => {
          // Clean HTML encoded entities (e.g., &amp;, &#8217;)
          const cleanTitle = decode(item.title?.rendered || "");

          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.articleContainer,
                pressed && styles.articlePressed,
              ]}
              onPress={() => router.push(`/latest_article/${item.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={`Read ${cleanTitle}`}
            >
              <Text style={styles.articleNumber}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{cleanTitle}</Text>
                {item.date ? (
                  <Text style={styles.articleDate}>
                    {formatDate(item.date)}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.articleArrow}>›</Text>
            </Pressable>
          );
        })}
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
  sectionHeader: {
    marginBottom: 18,
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
    fontSize: 26,
    fontWeight: "600",
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 12,
  },
  articleList: {
    gap: 10,
  },
  articleContainer: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.surface,
  },
  articlePressed: {
    opacity: 0.72,
  },
  articleNumber: {
    width: 34,
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 18,
  },
  articleContent: {
    flex: 1,
    paddingRight: 10,
  },
  articleTitle: {
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.serif,
    fontSize: 17,
    lineHeight: 23,
  },
  articleDate: {
    marginTop: 6,
    color: Brand.colors.muted,
    fontFamily: Fonts?.sans,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  articleArrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    lineHeight: 30,
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
  stateText: {
    marginTop: 10,
    color: Brand.colors.muted,
  },
  errorText: {
    color: Brand.colors.error,
    textAlign: "center",
  },
});
