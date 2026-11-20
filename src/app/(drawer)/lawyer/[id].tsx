import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import { Stack, useLocalSearchParams } from "expo-router";
import { decode } from "html-entities";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { WebView } from "react-native-webview";

export default function LawyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const [lawyer, setLawyer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webviewHeight, setWebviewHeight] = useState(500);

  const cleanHtmlAnchors = (html?: string) => {
    if (!html) return "";
    const decodedHtml = decode(html); // Decode &lt; and &gt; first if escaped
    return decodedHtml.replace(/<a\b[^>]*>(.*?)<\/a>/gis, "$1");
  };

  const fetchLawyer = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}advisor/${id}?_fields=id,title,content,featured_image_url,rs_details_content`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: any = await response.json();
      setLawyer(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load lawyer details",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLawyer();
  }, [fetchLawyer]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLawyer();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No lawyer data found.</Text>
      </View>
    );
  }

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
            ul, ol { margin: 0 0 18px; padding-left: 26px; }
            li { margin-bottom: 8px; padding-left: 4px; }
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
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 24px 0;
              font-size: 15px;
            }
            th, td {
              border: 1px solid ${Brand.colors.border};
              padding: 10px;
              text-align: left;
              vertical-align: top;
            }
            th { background: ${Brand.colors.surface}; font-weight: 700; }
            strong, b { color: ${Brand.colors.ink}; }
            a {
              color: ${Brand.colors.primary};
              font-weight: 600;
              text-decoration: underline;
              text-decoration-color: ${Brand.colors.primaryLight};
              text-underline-offset: 3px;
            }
            p {
              margin-top: 0;
              margin-bottom: 16px;
            }
            a {
              color: #A27440;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div id="content-container">
            ${lawyer.rs_details_content}
          </div>
          <script>
            function sendHeight() {
              var height = document.body.scrollHeight || document.documentElement.scrollHeight;
              window.ReactNativeWebView.postMessage(height);
            }
            window.onload = sendHeight;
            window.addEventListener('resize', sendHeight);
            document.querySelectorAll('img').forEach(function(image) {
              image.addEventListener('load', sendHeight);
            });
            if (window.ResizeObserver) {
              new ResizeObserver(sendHeight).observe(document.body);
            }
          </script>
        </body>
      </html>
    `;

  return (
    <>
      <Stack.Screen options={{ title: lawyer.full_name }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Image
          source={{ uri: lawyer.featured_image_url }}
          style={styles.photo}
          resizeMode="cover"
        />

        <View style={styles.headerSection}>
          <Text style={styles.name}>
            {cleanHtmlAnchors(lawyer.title?.rendered)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Biography</Text>
          <RenderHtml
            contentWidth={width - 32}
            source={{ html: lawyer.content.rendered }}
            baseStyle={styles.htmlBase}
          />
        </View>

        <View style={styles.card}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={[styles.webview, { height: webviewHeight }]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            nestedScrollEnabled={true}
            scrollEnabled={true} // Lets root ScrollView handle page scrolling
            onMessage={(event) => {
              const height = Number(event.nativeEvent.data);
              if (!Number.isNaN(height) && height > 0) {
                setWebviewHeight(height);
              }
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  webview: {
    width: "100%",
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  photo: {
    width: "100%",
    height: 280,
    backgroundColor: "#e0e0e0",
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  designation: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0a7ea4",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  htmlBase: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
