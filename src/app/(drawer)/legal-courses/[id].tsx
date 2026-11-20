import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const stripHtml = (html?: string) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
};

const getArticleTitle = (article: any) => {
  if (article.title?.rendered && article.title.rendered.trim().length > 0) {
    return article.title.rendered.trim();
  }
  const cleanText = stripHtml(article.content?.rendered);
  if (!cleanText) return "Untitled Article";
  return cleanText.length > 70 ? cleanText.substring(0, 70) + "..." : cleanText;
};

const getArticleExcerpt = (article: any) => {
  const cleanText = stripHtml(article.content?.rendered);
  if (!cleanText) return "";
  const title = article.title?.rendered?.trim();
  let content = cleanText;
  if (title && content.startsWith(title)) {
    content = content.substring(title.length).trim();
  }
  return content;
};

export default function LegalCoursesByCategory() {
  const [response, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);

  // ScrollView ref to jump to top on page change
  const scrollViewRef = useRef<ScrollView>(null);

  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();

  useEffect(() => {
    const source = axios.CancelToken.source();

    async function fetchLegalCourses() {
      setLoading(true);
      setError(null);
      try {
        const res: AxiosResponse<any[]> = await axios.get(
          `${API_BASE_URL}course?coursecat=${id}&_fields=name,id,title,content,date&per_page=10&page=${page}`,
          {
            cancelToken: source.token,
          },
        );

        setResponses(res.data);

        // Extract totals from headers
        const total = parseInt(res.headers["x-wp-total"] || "0", 10);
        const pages = parseInt(res.headers["x-wp-totalpages"] || "1", 10);

        setTotalPosts(total);
        setTotalPages(pages);
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

    fetchLegalCourses();

    return () => {
      source.cancel("Component unmounted, canceling API call.");
    };
  }, [id, page]); // Re-run fetch on page or category change

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

  if (loading && response.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading course materials...</Text>
      </View>
    );
  }

  if (error || (response.length === 0 && !loading)) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No course materials found."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headingContainer}>
        <Text style={styles.eyebrow}>KNOWLEDGE CENTRE</Text>
        <Text style={styles.heading}>{type} Legal Courses</Text>
        {totalPosts > 0 ? (
          <Text style={styles.subtext}>
            Total Courses Available: {totalPosts}
          </Text>
        ) : null}
        <View style={styles.headingRule} />
      </View>

      {/* List Container with conditional overlay loader when fetching next page */}
      <View style={styles.listContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator animating={true} size="small" />
          </View>
        )}

        {response.map((item) => {
          const title = getArticleTitle(item);
          const excerpt = getArticleExcerpt(item);
          const formattedDate = formatDate(item.date);

          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.articleCard,
                pressed && styles.articleCardPressed,
              ]}
              onPress={() => {
                router.push({
                  pathname: `/legal-courses/detail/[id]` as any,
                  params: { id: item.id },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Read ${title}`}
            >
              <View style={styles.metaRow}>
                {formattedDate ? (
                  <Text style={styles.dateText}>{formattedDate}</Text>
                ) : null}
              </View>

              <Text style={styles.articleTitle} numberOfLines={2}>
                {decode(title)}
              </Text>

              {excerpt ? (
                <Text style={styles.articleExcerpt} numberOfLines={3}>
                  {decode(excerpt)}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.readMoreText}>Read Article</Text>
                <Text style={styles.readMoreArrow}>›</Text>
              </View>
            </Pressable>
          );
        })}
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
  screen: {
    flex: 1,
    backgroundColor: Brand.colors.surface,
  },
  screenContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headingContainer: {
    padding: 22,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
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
    fontSize: 28,
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
    gap: 14,
    position: "relative",
  },
  loadingOverlay: {
    paddingVertical: 12,
    alignItems: "center",
  },
  articleCard: {
    width: "100%",
    padding: 18,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  articleCardPressed: {
    opacity: 0.85,
    backgroundColor: "#FAF6F0",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    color: Brand.colors.muted,
    fontFamily: Fonts?.sans,
    fontSize: 12,
  },
  articleTitle: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 8,
  },
  articleExcerpt: {
    color: "#4A4A4A",
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(214, 194, 171, 0.3)",
  },
  readMoreText: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: "600",
  },
  readMoreArrow: {
    color: Brand.colors.primary,
    fontSize: 18,
    fontWeight: "600",
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

  /* Pagination Controls Styles */
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
