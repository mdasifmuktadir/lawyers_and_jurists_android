import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  Icon,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { WebView } from "react-native-webview";

import { lawyer_ci_url } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";

interface Item {
  id: number;
  title: string;
  division: string;
  case_no: string;
  judge: string;
  advocate: string;
  citation: string;
  case_year: number;
  appellant: string;
  respondent: string;
  subject: string;
  delivery_date: string;
  court: string;
  document: string;
  type: string;
  subtype: string;
}

export default function Article() {
  const theme = useTheme();
  const [response, setResponses] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewHeight, setWebViewHeight] = useState<number>(500);

  const { slug } = useLocalSearchParams<{ slug: string }>();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const source = axios.CancelToken.source();

    async function fetchDigestDetails() {
      try {
        const res = await axios.get(
          `${lawyer_ci_url}digest_details_json/${slug}`,
          {
            cancelToken: source.token,
          },
        );
        setResponses(res.data.data.case_details);
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

    fetchDigestDetails();

    return () => {
      source.cancel("Component unmounted or ID changed.");
    };
  }, [slug]);

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
          Fetching Case Details...
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
          {error || "No case content found."}
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
            font-family: ${Fonts?.sans || "sans-serif"};
            font-size: 17px;
            line-height: 1.7;
            color: ${Brand.colors.inkSoft};
            background-color: ${Brand.colors.background};
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
            color: ${Brand.colors.ink};
            font-family: ${Fonts?.serif || "serif"};
            line-height: 1.25;
            font-weight: 600;
          }
          h1 { font-size: 32px; margin: 0 0 24px; }
          h2 { font-size: 25px; margin: 32px 0 14px; }
          h3 { font-size: 20px; margin: 26px 0 10px; }
          h4 { font-size: 17px; margin: 22px 0 8px; }
          p { margin: 0 0 16px; }
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
        </style>
      </head>
      <body>
        <div id="content-container">${response.content}</div>
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
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <Surface elevation={1} style={styles.headerSurface}>
        <View style={styles.chipRow}>
          {response.court ? (
            <Chip icon="bank" style={styles.chip} compact>
              {decode(response.court)}
            </Chip>
          ) : null}
          {response.division ? (
            <Chip icon="scale-balance" style={styles.chip} compact>
              {decode(response.division)}
            </Chip>
          ) : null}
          {response.case_year ? (
            <Chip icon="calendar" style={styles.chip} compact>
              {decode(response.case_year)}
            </Chip>
          ) : null}
        </View>

        <Text variant="headlineMedium" style={styles.mainTitle}>
          {decode(response.title)}
        </Text>

        <View style={styles.subHeaderRow}>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {decode(response.case_no)}
          </Text>
          {response.citation ? (
            <Text variant="labelLarge" style={{ color: theme.colors.outline }}>
              Citation: {decode(response.citation)}
            </Text>
          ) : null}
        </View>
      </Surface>

      {/* Case Details Card */}
      <Card mode="outlined" style={styles.detailsCard}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleSmall" style={styles.sectionHeader}>
            CASE METADATA
          </Text>

          {/* Litigants Block */}
          <View style={styles.metaRow}>
            <Icon
              source="account-group"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Parties
              </Text>
              <Text variant="bodyMedium">
                <Text style={styles.boldText}>Appellant: </Text>
                {decode(response.appellant) || "N/A"}
              </Text>
              <Text variant="bodyMedium">
                <Text style={styles.boldText}>Respondent: </Text>
                {decode(response.respondent) || "N/A"}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Legal Personnel Block */}
          <View style={styles.metaRow}>
            <Icon source="gavel" size={20} color={theme.colors.primary} />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Bench & Counsel
              </Text>
              <Text variant="bodyMedium">
                <Text style={styles.boldText}>Judge: </Text>
                {decode(response.judge) || "N/A"}
              </Text>
              <Text variant="bodyMedium">
                <Text style={styles.boldText}>Advocate: </Text>
                {decode(response.advocate) || "N/A"}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Subject & Delivery Date */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Subject
              </Text>
              <Text variant="bodyMedium" numberOfLines={2}>
                {decode(response.subject) || "N/A"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Delivery Date
              </Text>
              <Text variant="bodyMedium">
                {decode(response.delivery_date) || "N/A"}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Document Section */}
      <Text variant="titleMedium" style={styles.documentHeader}>
        Full Judgment / Document
      </Text>

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
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Brand.colors.surface,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  stateText: {
    marginTop: 12,
    color: Brand.colors.muted,
  },
  headerSurface: {
    padding: 22,
    borderRadius: Brand.radius.large,
    marginBottom: 14,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: Brand.radius.medium,
    borderColor: Brand.colors.primary,
    backgroundColor: Brand.colors.background,
  },
  mainTitle: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontWeight: "600",
    lineHeight: 36,
    marginBottom: 8,
  },
  subHeaderRow: {
    flexDirection: "column",
    gap: 4,
  },
  detailsCard: {
    marginBottom: 20,
    borderRadius: Brand.radius.large,
    borderColor: Brand.colors.border,
    backgroundColor: Brand.colors.background,
  },
  cardContent: {
    gap: 12,
  },
  sectionHeader: {
    color: Brand.colors.primary,
    letterSpacing: 1.2,
    fontWeight: "700",
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
    backgroundColor: Brand.colors.border,
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
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  webview: {
    width: "100%",
    borderRadius: Brand.radius.medium,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
});
