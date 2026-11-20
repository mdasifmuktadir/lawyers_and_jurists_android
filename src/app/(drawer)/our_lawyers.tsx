import { API_BASE_URL } from "@/config/apiUrls";
import { Brand } from "@/constants/theme";
import axios from "axios";
import { useRouter } from "expo-router";
import { decode } from "html-entities";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ActivityIndicator, Card, Chip, Text } from "react-native-paper";
import RenderHtml from "react-native-render-html";

// Updated Interface to match WordPress REST API response
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Lawyer {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media: number;
  featured_image_url: string;
  advisor_categories?: Category[];
}

export default function LawyersListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [lawyersData, setLawyersData] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const decodeAll = (s: string) => {
    let cur = s;
    for (let i = 0; i < 3; i++) {
      const next = decode(cur);
      if (next === cur) break;
      cur = next;
    }
    return cur;
  };

  const cleanHtmlAnchors = (html?: string) => {
    if (!html) return "";
    const decodedHtml = decode(html); // Decode &lt; and &gt; first if escaped
    return decodedHtml.replace(/<a\b[^>]*>(.*?)<\/a>/gis, "$1");
  };

  // Helper to verify HTML content contains actual visible text
  const isHtmlContentValid = useCallback((html?: string) => {
    if (!html) return false;
    const stripped = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();
    return stripped.length > 0;
  }, []);

  // 1. Fetch data directly inside the page
  const fetchLawyers = useCallback(async () => {
    try {
      setError(null);
      const endpoint =
        API_BASE_URL +
        "advisor?per_page=100&_fields=id,date,slug,title,featured_media,advisor_categories,content,featured_image_url";

      const response = await axios.get<Lawyer[]>(endpoint);

      // FIX #1: Set response.data directly (it is an array, not response.data[0])
      // setLawyersData(Array.isArray(response.data) ? response.data : []);
      setLawyersData(
        response.data.filter(
          (item) => item.slug !== "correlation-of-human-rights-and-development",
        ),
      );
    } catch (err: any) {
      setError("Failed to load lawyers. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLawyers();
  }, [fetchLawyers]);

  // 2. Group lawyers by designation and sort categories (least items first)
  const groupedLawyers = useMemo(() => {
    if (!Array.isArray(lawyersData) || lawyersData.length === 0) return [];

    const groups: { [key: string]: Lawyer[] } = {};

    lawyersData.forEach((lawyer) => {
      const designation = lawyer.advisor_categories?.[0]?.name || "Other";
      if (!groups[designation]) {
        groups[designation] = [];
      }
      groups[designation].push(lawyer);
    });

    return Object.keys(groups)
      .map((key) => ({
        designation: key,
        lawyers: groups[key],
      }))
      .sort((a, b) => a.lawyers.length - b.lawyers.length);
  }, [lawyersData]);

  // 3. Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A27440" />
        <Text style={styles.loadingText}>Loading Lawyers...</Text>
      </View>
    );
  }

  // 4. Error State
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const contentWidth = width - 32;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {groupedLawyers.map((group) => (
        <View key={group.designation} style={styles.sectionContainer}>
          {/* Group Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{group.designation}</Text>
            <Chip compact style={styles.countChip}>
              {group.lawyers.length}{" "}
              {group.lawyers.length === 1 ? "Lawyer" : "Lawyers"}
            </Chip>
          </View>

          {/* Full-Width Lawyer Item Cards */}
          {group.lawyers.map((lawyer) => (
            <Pressable
              key={lawyer.id}
              onPress={() => router.push(`/lawyer/${lawyer.id}` as any)}
            >
              <Card style={styles.card} mode="elevated">
                {/* FIX #2: Correct property mapping for featured_image_url */}
                {lawyer.featured_image_url ? (
                  <Image
                    source={{ uri: lawyer.featured_image_url }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : null}

                <Card.Content style={styles.cardContent}>
                  {/* FIX #3: Correct property mapping for title */}
                  <Text style={styles.name}>
                    {cleanHtmlAnchors(lawyer.title?.rendered)}
                  </Text>

                  {/* FIX #4: Correct property mapping for bio content */}
                  {
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Bio:</Text>
                      <RenderHtml
                        contentWidth={contentWidth}
                        source={{
                          html: lawyer.content.rendered,
                        }}
                        tagsStyles={{
                          body: {
                            color: "#444444",
                            fontSize: 14,
                            lineHeight: 20,
                          },
                          p: {
                            marginTop: 0,
                            marginBottom: 8,
                            color: "#444444",
                            fontSize: 14,
                            lineHeight: 20,
                          },
                          span: {
                            fontSize: 14,
                            lineHeight: 20,
                          },
                          a: {
                            color: Brand.colors.primary,
                          },
                        }}
                      />
                    </View>
                  }
                </Card.Content>
              </Card>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  scrollContent: {
    paddingVertical: 16,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  countChip: {
    backgroundColor: "#EAEAEA",
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 240,
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  infoRow: {
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    fontSize: 16,
    color: "#D9534F",
  },
});
