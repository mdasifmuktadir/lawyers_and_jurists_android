import { Custom_API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityIndicator, Button, Text } from "react-native-paper";
import { Carousel } from "react-native-reanimated-carousel";
import YoutubePlayer from "react-native-youtube-iframe";

// 1. Import Axios
import axios from "axios";
import { decode } from "html-entities";

// Helper to extract the 11-character YouTube video ID from various URL formats

export default function RecentVideos() {
  const [response, setResponses] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { width: SCREEN_WIDTH } = useWindowDimensions();

  useEffect(() => {
    // 2. Set up an AbortController to cancel requests if component unmounts mid-fetch
    const source = axios.CancelToken.source();

    async function fetchVideos() {
      try {
        // 3. Make the API call using Axios
        const response = await axios.get(
          Custom_API_BASE_URL + `custom/v1/youtube?per_page=10`,
          {
            cancelToken: source.token,
          },
        );

        // Axios stores parsed JSON data inside the '.data' property automatically
        console.log("here are the video data");
        console.log(response.data);
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

    fetchVideos();

    // Cleanup token function executed if user leaves screen before API resolves
    return () => {
      source.cancel("Component unmounted, canceling API call.");
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading recent videos...</Text>
      </View>
    );
  }

  if (error || !response || response.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No recent videos found."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.eyebrow}>MEDIA & INSIGHTS</Text>
        <Text style={styles.heading}>Recent Videos</Text>
        <View style={styles.headingRule} />
        <Button
          mode="outlined"
          compact
          onPress={() => router.push("/videos" as never)}
          style={styles.moreVideosButton}
          labelStyle={styles.moreVideosLabel}
        >
          More videos
        </Button>
      </View>
      <Carousel
        loop={true}
        style={{ width: SCREEN_WIDTH, height: 340 }}

        autoplay={true}
        data={response}
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-10, 10]);
        }}
        renderItem={({ item }) => (
          <View style={styles.cardFrame}>
            <YouTubeModalPlayer
              videoid={item.video_id}
              title={item.video_title}
              thumbnail={item.video_thumbnail}
            />

            <Text style={styles.videoTitle}>{decode(item.video_title)}</Text>
          </View>
        )}
      />
    </View>
  );
}

// const getYouTubeId = (url: string) => {
//   if (!url) return null;
//   const regExp =
//     /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : null;
// };

export const YouTubeModalPlayer = ({
  videoid,
  title,
  thumbnail,
}: {
  videoid: string;
  title: string;
  thumbnail: string;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoId = videoid;

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;

  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid YouTube URL</Text>
      </View>
    );
  }

  // High-quality thumbnail URL from YouTube CDN

  const handleOpenModal = () => {
    setModalVisible(true);
    setPlaying(true);
    setLoading(true);
  };

  const handleCloseModal = () => {
    setPlaying(false);
    setModalVisible(false);
  };

  return (
    <View>
      {/* Thumbnail with Play Icon Overlay */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenModal}
        style={styles.thumbnailContainer}
      >
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        <View style={styles.playButtonOverlay}>
          <View style={styles.playTriangle} />
        </View>
      </TouchableOpacity>

      {/* Full-Screen Video Modal */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
        supportedOrientations={[
          "portrait",
          "landscape",
          "landscape-left",
          "landscape-right",
        ]}
      >
        <SafeAreaView style={styles.modalBackground}>
          {/* Header Bar with Close Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Video Container */}
          <View style={styles.playerWrapper}>
            {loading && (
              <ActivityIndicator
                size="large"
                color={Brand.colors.primary}
                style={StyleSheet.absoluteFill}
              />
            )}
            <YoutubePlayer
              height={windowHeight * (9 / 16)} // Maintain 16:9 aspect ratio
              width={windowWidth}
              play={playing}
              videoId={videoId}
              onReady={() => setLoading(false)}
              onChangeState={(state: any) => {
                if (state === "ended") {
                  setPlaying(false);
                }
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: Brand.colors.background,
    width: "100%",
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  absoluteFillObject: {},
  carouselContainer: {
    height: 220,
    width: "100%",
    backgroundColor: Brand.colors.surface,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  eyebrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  sectionHeader: {
    width: "100%",
    alignItems: "flex-start",
  },
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 27,
    fontWeight: "600",
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 2,
  },
  videoTitle: {
    alignSelf: "stretch",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  moreVideosButton: {
    marginTop: 14,
    alignSelf: "flex-end",

    borderColor: Brand.colors.primary,
    borderRadius: Brand.radius.medium,
  },
  moreVideosLabel: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 12,
  },
  stateText: {
    marginTop: 10,
    color: Brand.colors.muted,
  },
  message: {
    flex: 7,
    alignItems: "center",

    justifyContent: "center",
    textAlign: "center",
  },
  description: {
    flex: 1,
  },
  cardFrame: {
    flex: 1,
    overflow: "scroll",
    borderRadius: 8,
    width: "80%",
    marginHorizontal: 16,
    backgroundColor: Brand.colors.background,
    height: 400,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    alignItems: "center",
    alignSelf: "center",
  },
  header: {
    padding: 16,
    alignItems: "flex-end",
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  thumbnailContainer: {
    width: 300,
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  playButtonOverlay: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "center",
    alignItems: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 18,
    borderRightWidth: 0,
    borderBottomWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: "#FFFFFF",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
    marginLeft: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: Brand.colors.ink,
  },
  closeButton: {
    padding: 8,
    backgroundColor: Brand.colors.ink,
    borderWidth: 1,
    borderColor: Brand.colors.primary,
    borderRadius: Brand.radius.medium,
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  playerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#F4EEE8",
    borderRadius: Brand.radius.medium,
  },
  errorText: {
    color: Brand.colors.error,
  },
});
