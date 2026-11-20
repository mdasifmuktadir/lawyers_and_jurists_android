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

import { Custom_API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";

export default function Article() {
  const theme = useTheme();
  const [response, setResponses] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track WebView height dynamically so content flows naturally
  const [webViewHeight, setWebViewHeight] = useState<number>(500);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const source = axios.CancelToken.source();

    async function fetchLawDetails() {
      try {
        const res = await axios.get(
          `${Custom_API_BASE_URL}custom/v1/law-case/${id}`,
          {
            cancelToken: source.token,
          },
        );
        console.log("these are the law response");
        setResponses(res.data.data);
        console.log(res.data);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Something went wrong while fetching the law details.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLawDetails();

    return () => {
      source.cancel("Component unmounted or ID changed, canceling API call.");
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
          Loading Law Details...
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
          {error || "No content found."}
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
        <div id="content-container">
          ${response.content}
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
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <Surface elevation={1} style={styles.headerSurface}>
        <View style={styles.chipRow}>
          {response.case_year ? (
            <Chip icon="calendar" style={styles.chip} compact>
              {decode(response.case_year)}
            </Chip>
          ) : null}
        </View>

        <Text variant="headlineMedium" style={styles.mainTitle}>
          {decode(response.title)}
        </Text>
      </Surface>

      {/* Law Metadata Card */}
      <Card mode="outlined" style={styles.detailsCard}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleSmall" style={styles.sectionHeader}>
            LAW METADATA
          </Text>

          {/* Subject Block */}
          <View style={styles.metaRow}>
            <Icon
              source="bookmark-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Subject / Scope
              </Text>
              <Text variant="bodyMedium">
                {decode(response.subject) || "N/A"}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Delivery / Enactment Date Block */}
          <View style={styles.metaRow}>
            <Icon
              source="clock-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Delivery / Enactment Date
              </Text>
              <Text variant="bodyMedium">
                {decode(response.delivery_date) || "N/A"}
              </Text>
            </View>
          </View>
          {/* <View style={styles.metaRow}>
            <Icon
              source="account-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Appellant
              </Text>
              <Text variant="bodyMedium">{response.appellant || "N/A"}</Text>
            </View>
          </View> */}
          {/* <View style={styles.metaRow}>
            <Icon
              source="account-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Respondent
              </Text>
              <Text variant="bodyMedium">{response.respondent || "N/A"}</Text>
            </View>
          </View> */}
          <View style={styles.metaRow}>
            <Icon
              source="file-document-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Relevant Sections
              </Text>
              <Text variant="bodyMedium">
                {decode(response.relevant_section) || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Icon
              source="file-document-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Relevant Laws
              </Text>
              <Text variant="bodyMedium">
                {decode(response.relevant_law) || "N/A"}
              </Text>
            </View>
          </View>
          {/* <View style={styles.metaRow}>
            <Icon
              source="account-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Judge
              </Text>
              <Text variant="bodyMedium">{response.judge || "N/A"}</Text>
            </View>
          </View> */}
          {/* <View style={styles.metaRow}>
            <Icon
              source="account-tie-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.metaTextContainer}>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.outline }}
              >
                Advocate
              </Text>
              <Text variant="bodyMedium">{response.advocate || "N/A"}</Text>
            </View>
          </View> */}
        </Card.Content>
      </Card>

      {/* Document Section */}
      <Text variant="titleMedium" style={styles.documentHeader}>
        Statute / Document Text
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
        scrollEnabled={false}
        onMessage={handleMessage}
        nestedScrollEnabled={true}
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
    marginBottom: 4,
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
  divider: {
    marginVertical: 4,
    backgroundColor: Brand.colors.border,
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
