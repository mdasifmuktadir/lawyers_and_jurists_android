import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { WebView } from "react-native-webview";

interface Item {
  id: string;
  document: string;
  title: string;
}

export default function AboutUs() {
  const [response, setResponses] = useState<any>();
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track WebView height dynamically so content flows naturally
  const [webViewHeight, setWebViewHeight] = useState<number>(500);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const source = axios.CancelToken.source();

    async function fetchImages() {
      try {
        const res = await axios.get(
          `${API_BASE_URL}pages?slug=corporate-lawyer-about-us&_embed`,
          {
            cancelToken: source.token,
          },
        );

        const pageData = res.data[0];
        setResponses(pageData);

        // Safely extract featured media URL (prefers source_url, falls back to link)
        const media = pageData?._embedded?.["wp:featuredmedia"]?.[0];
        const imageUrl = media?.source_url || media?.link || null;
        setFeaturedImage(imageUrl);

        console.log("Response content:", pageData);
        console.log("Featured Image URL:", imageUrl);
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

    fetchImages();

    return () => {
      source.cancel("Component unmounted, canceling API call.");
    };
  }, []);

  // Handler to receive height calculated inside WebView JS
  const handleMessage = (event: any) => {
    const height = Number(event.nativeEvent.data);
    if (height && height > 0) {
      setWebViewHeight(height);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading About Us...</Text>
      </View>
    );
  }

  if (error || !response) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No content found."}
        </Text>
      </View>
    );
  }

  // HTML template with mobile viewport, styled typography, and auto-height script
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: ${Fonts?.sans || "sans-serif"};
            font-size: 18px;
            line-height: 1.7;
            color: ${Brand.colors.inkSoft};
            padding: 24px 18px 36px;
            margin: 0;
            background-color: ${Brand.colors.background};
            -webkit-font-smoothing: antialiased;
          }
          #content-container {
            max-width: 860px;
            margin: 0 auto;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 24px auto;
            border: 1px solid ${Brand.colors.border};
            border-radius: 4px;
          }
          h1, h2, h3, h4 {
            font-family: ${Fonts?.serif || "serif"};
            color: ${Brand.colors.ink};
            line-height: 1.25;
            font-weight: 600;
          }
          h1 { font-size: 32px; margin: 0 0 24px; }
          h2 { font-size: 25px; margin: 32px 0 14px; }
          h3 { font-size: 20px; margin: 26px 0 10px; }
          h4 { font-size: 17px; margin: 22px 0 8px; }
          p {
            margin-top: 0;
            margin-bottom: 16px;
          }
          ul, ol {
            margin: 0 0 18px;
            padding-left: 26px;
          }
          li {
            margin-bottom: 8px;
            padding-left: 4px;
          }
          hr {
            border: 0;
            border-top: 1px solid ${Brand.colors.border};
            margin: 28px 0;
          }
          blockquote {
            border-left: 2px solid ${Brand.colors.primary};
            color: ${Brand.colors.muted};
            margin: 24px 0;
            padding: 8px 0 8px 18px;
            font-family: ${Fonts?.serif || "serif"};
            font-style: italic;
          }
          strong, b {
            color: ${Brand.colors.ink};
          }
          a {
            color: ${Brand.colors.primary};
            font-weight: 600;
            text-decoration: underline;
            text-decoration-color: ${Brand.colors.primaryLight};
            text-underline-offset: 3px;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div id="content-container">
          ${response.content.rendered}
        </div>
        <script>
          function sendHeight() {
            var height = document.body.scrollHeight || document.documentElement.scrollHeight;
            window.ReactNativeWebView.postMessage(height);
          }
          window.onload = sendHeight;
          window.addEventListener('resize', sendHeight);

          // Recalculate height when image assets finish loading inside HTML
          var images = document.getElementsByTagName('img');
          for (var i = 0; i < images.length; i++) {
            images[i].addEventListener('load', sendHeight);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title Header */}
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>About Us</Text>
        <View style={styles.headingRule} />
      </View>

      {/* Featured Image */}
      {featuredImage && (
        <View style={styles.featuredImageContainer}>
          <Image
            source={{ uri: featuredImage }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Page Content Body */}
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={[styles.webview, { height: webViewHeight }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={true} // Disables internal WebView scroll so the main ScrollView handles it
        nestedScrollEnabled={true}
        onMessage={handleMessage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: "100%",
    backgroundColor: Brand.colors.surface,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 36,
  },
  headingContainer: {
    padding: 22,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
    marginBottom: 14,
  },
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 35,
    textAlign: "left",
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 14,
  },
  featuredImageContainer: {
    width: "100%",
    height: 220,
    marginBottom: 14,
    borderRadius: Brand.radius.medium,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Brand.colors.border,
    backgroundColor: Brand.colors.background,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  webview: {
    width: "100%",
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
  },
  carouselContainer: {
    flex: 1,
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
