import { YouTubeModalPlayer } from "@/components/RecentVideos";
import { Custom_API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { decode } from "html-entities";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Text,
} from "react-native-paper";

const PER_PAGE = 20;

export default function VideosScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const fetchVideos = useCallback(
    async (pageNumber: number, signal: AbortSignal) => {
      try {
        setError(null);
        setPageLoading(true);

        const result = await axios.get(
          `${Custom_API_BASE_URL}custom/v1/youtube`,
          {
            params: { per_page: PER_PAGE, page: pageNumber },
            signal,
          },
        );

        const data: any[] = Array.isArray(result.data)
          ? result.data
          : (result.data?.items ?? []);
        setVideos(data);

        const headerTotal = parseInt(result.headers?.["x-wp-totalpages"], 10);
        setTotalPages(Number.isNaN(headerTotal) ? null : headerTotal);

        scrollRef.current?.scrollTo({ y: 0, animated: false });
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load videos.",
        );
      } finally {
        setInitialLoading(false);
        setPageLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchVideos(page, controller.signal);
    return () => controller.abort();
  }, [page, fetchVideos]);

  const hasPrev = page > 1;
  const hasNext =
    totalPages !== null ? page < totalPages : videos.length === PER_PAGE;

  if (initialLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={Brand.colors.primary} />
        <Text style={styles.stateText}>Loading videos...</Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          compact
          onPress={() => fetchVideos(page, new AbortController().signal)}
          style={{ marginTop: 10 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>No videos are available.</Text>
        {hasPrev && (
          <Button compact onPress={() => setPage(1)} style={{ marginTop: 10 }}>
            Back to first page
          </Button>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MEDIA & INSIGHTS</Text>
        <Text style={styles.heading}>All Videos</Text>
        <View style={styles.headingRule} />
      </View>

      <View style={{ opacity: pageLoading ? 0.4 : 1 }}>
        {videos.map((video, index) => {
          // const id = getYouTubeId(video.video_id ?? video.video_url);
          // const thumbnail =
          //   video.video_thumbnail ||
          //   (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "");

          return (
            <Card
              key={`${video.id ?? index}`}
              mode="outlined"
              style={styles.videoCard}
            >
              <Card.Content style={styles.videoContent}>
                <YouTubeModalPlayer
                  videoid={video.video_id}
                  title={video.title}
                  thumbnail={video.video_thumbnail}
                />
                <Divider style={styles.divider} />
                <Text style={styles.videoTitle}>
                  {decode(video.video_title)}
                </Text>
              </Card.Content>
            </Card>
          );
        })}
      </View>

      {/* Pagination controls */}
      <View style={styles.pagination}>
        <Button
          mode="outlined"
          compact
          disabled={!hasPrev || pageLoading}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          style={styles.pageButton}
          labelStyle={styles.pageButtonLabel}
        >
          ‹ Prev
        </Button>

        <Text style={styles.pageText}>
          {pageLoading
            ? "Loading..."
            : totalPages
              ? `Page ${page} of ${totalPages}`
              : `Page ${page}`}
        </Text>

        <Button
          mode="outlined"
          compact
          disabled={!hasNext || pageLoading}
          onPress={() => setPage((p) => p + 1)}
          style={styles.pageButton}
          labelStyle={styles.pageButtonLabel}
        >
          Next ›
        </Button>
      </View>

      {error && (
        <Text style={[styles.errorText, { marginTop: 12 }]}>{error}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.colors.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    padding: 22,
    marginBottom: 16,
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
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 29,
    fontWeight: "600",
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 12,
  },
  videoCard: {
    marginBottom: 14,
    backgroundColor: Brand.colors.background,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  videoContent: {
    alignItems: "center",
    padding: 18,
  },
  divider: {
    alignSelf: "stretch",
    backgroundColor: Brand.colors.border,
    marginTop: 16,
    marginBottom: 12,
  },
  videoTitle: {
    alignSelf: "stretch",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    alignSelf: "stretch",
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  pageButton: {
    borderColor: Brand.colors.primary,
    borderRadius: Brand.radius.medium,
  },
  pageButtonLabel: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 12,
  },
  pageText: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.sans,
    fontSize: 13,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: Brand.colors.surface,
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
