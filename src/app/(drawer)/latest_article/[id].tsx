import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { decode } from "html-entities";
import {
  ActivityIndicator,
  Icon,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { WebView } from "react-native-webview";

import api_urls from "@/config/apiUrls";

interface Item {
  id: number;
  title: string;
  type: string;
  document: string;
}

export default function LatestArticle() {
  const theme = useTheme();
  const [response, setResponses] = useState<Item>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewHeight, setWebViewHeight] = useState<number>(500);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const source = axios.CancelToken.source();

    async function fetchCaseDetails() {
      try {
        const res = await axios.get(`${api_urls.articles}${id}`, {
          cancelToken: source.token,
        });
        setResponses(res.data);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
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

    fetchCaseDetails();

    return () => {
      source.cancel("Component unmounted or ID changed.");
    };
  }, [id]);

  const handleMessage = (event: any) => {
    const height = Number(event.nativeEvent.data);
    if (height && height > 0) {
      setWebViewHeight(height);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator animating={true} size="large" />
        <Text variant="bodyLarge" style={styles.stateText}>
          Fetching Course Details...
        </Text>
      </View>
    );
  }

  if (error || !response) {
    return (
      <View style={styles.centerState}>
        <Icon
          source="alert-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text
          variant="bodyLarge"
          style={[styles.stateText, { color: theme.colors.error }]}
        >
          {error || "No Course content found."}
        </Text>
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Roboto, -apple-system, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: ${theme.colors.onSurface};
            background-color: ${theme.colors.surface};
            padding: 0;
            margin: 0;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 16px auto;
            border-radius: 12px;
          }
          h1, h2, h3 { color: ${theme.colors.onSurface}; font-weight: 600; }
          p { margin-bottom: 16px; }
          a { color: ${theme.colors.primary}; text-decoration: none; }
        </style>
      </head>
      <body>
        <div id="content-container">${response.document}</div>
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
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <Surface elevation={1} style={styles.headerSurface}>
        <Text variant="headlineMedium" style={styles.mainTitle}>
          {decode(response.title)}
        </Text>
      </Surface>

      {/* Case Details Card */}

      {/* Document Section */}

      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={[
          styles.webview,
          { height: webViewHeight, backgroundColor: theme.colors.surface },
        ]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        onMessage={handleMessage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  stateText: {
    marginTop: 12,
  },
  headerSurface: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 8,
  },
  mainTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  subHeaderRow: {
    flexDirection: "column",
    gap: 4,
  },
  detailsCard: {
    marginBottom: 20,
    borderRadius: 16,
  },
  cardContent: {
    gap: 12,
  },
  sectionHeader: {
    letterSpacing: 1,
    fontWeight: "700",
    opacity: 0.7,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  metaTextContainer: {
    flex: 1,
    gap: 2,
  },
  boldText: {
    fontWeight: "600",
  },
  divider: {
    marginVertical: 4,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  documentHeader: {
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  webview: {
    width: "100%",
    borderRadius: 12,
  },
});
