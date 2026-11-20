import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { WebView } from "react-native-webview";

export default function Service() {
  const [response, setResponses] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track WebView height dynamically so content flows naturally
  const [webViewHeight, setWebViewHeight] = useState<number>(500);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    // 1. Immediately reset loading state so the old data hides
    setLoading(true);
    setError(null);

    const source = axios.CancelToken.source();

    async function fetchService() {
      try {
        const res = await axios.get(
          `${API_BASE_URL}posts/${id}?_fields=id,title,content,modified,date`,
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

    fetchService();

    return () => {
      source.cancel("Component unmounted or ID changed, canceling API call.");
    };
  }, [id]); // 2. Fixed: Added [id] here so it triggers on route parameter updates

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
        <Text style={{ marginTop: 10 }}>Loading Service...</Text>
      </View>
    );
  }

  if (error || !response) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={{ color: "red" }}>
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
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>{decode(response.title.rendered)}</Text>
      </View>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={[styles.webview, { height: webViewHeight }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false} // Lets root ScrollView handle page scrolling
        onMessage={handleMessage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    height: "100%",
    backgroundColor: "#ffffff",
    alignSelf: "center",
  },
  headingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#111111",
    borderBottomWidth: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 20,
    textAlign: "center",
  },
  webview: {
    width: "100%",
    height: "100%",

    margin: 10,
  },
  carouselContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#E8DCCF",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
