import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import he from "he";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { Carousel } from "react-native-reanimated-carousel";
import striptags from "striptags";

// 1. Import Axios
import axios from "axios";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const cleanHtmlText = (rawHtml = "") => {
  if (!rawHtml) return "";

  // 1. Strip all HTML tags (<p>, <div>, <b>, etc.)
  const stripped = striptags(rawHtml);

  // 2. Decode HTML entities (&amp;, &#8217;, &quot;, etc.)
  const decoded = he.decode(stripped);

  return decoded.trim();
};

export default function ClientFeedback() {
  const [response, setResponses] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 2. Set up an AbortController to cancel requests if component unmounts mid-fetch
    const source = axios.CancelToken.source();

    async function fetchTestimonials() {
      try {
        // 3. Make the API call using Axios
        const response = await axios.get(
          API_BASE_URL +
            `testimonial?_fields=id,%20title,content,client_description`,
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

    fetchTestimonials();

    // Cleanup token function executed if user leaves screen before API resolves
    return () => {
      source.cancel("Component unmounted, canceling API call.");
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading client feedback...</Text>
      </View>
    );
  }

  if (error || !response || response.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No client feedback found."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eyebrow}>CLIENT PERSPECTIVES</Text>
        <Text style={styles.heading}>Client Feedback</Text>
        <View style={styles.headingRule} />
      </View>
      <Carousel
        loop={true}
        style={{ width: SCREEN_WIDTH, height: 220 }}

        autoplay={true}
        data={response}
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-10, 10]);
        }}
        renderItem={({ item }) => (
          <View style={styles.cardFrame}>
            <View style={styles.message}>
              <Text style={styles.message}>
                {cleanHtmlText(item.content.rendered)}
              </Text>
            </View>
            <View style={styles.description}>
              <Text style={styles.description}>
                {cleanHtmlText(item.title.rendered)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: Brand.colors.background,
    margin: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  carouselContainer: {
    height: 220,
    width: "100%",
    backgroundColor: Brand.colors.surface,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    flex: 7,
    alignItems: "center",
    fontStyle: "italic",
    justifyContent: "center",
    textAlign: "center",
  },
  description: {
    flex: 1,
    fontWeight: "bold",
  },
  cardFrame: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 8,
    marginHorizontal: 16,
    backgroundColor: Brand.colors.background,
    height: 400,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    alignItems: "center",
  },
  eyebrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
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
  stateText: {
    marginTop: 10,
    color: Brand.colors.muted,
  },
  errorText: {
    color: Brand.colors.error,
    textAlign: "center",
  },
});
