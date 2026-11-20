import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { router } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Surface, Text } from "react-native-paper";

export default function docs() {
  const [response, setResponses] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 2. Set up an AbortController to cancel requests if component unmounts mid-fetch
    const source = axios.CancelToken.source();

    async function fetchImages() {
      try {
        // 3. Make the API call using Axios
        const response = await axios.get(
          `${API_BASE_URL}doclitcat?parent=21&_fields=id,name&per_page=50`,
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

    fetchImages();

    // Cleanup token function executed if user leaves screen before API resolves
    return () => {
      source.cancel("Component unmounted, canceling API call.");
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading documentation...</Text>
      </View>
    );
  }

  if (error || response?.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No documentation found."}
        </Text>
      </View>
    );
  }
  return (
    <ScrollView
      contentContainerStyle={styles.main}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={styles.container} elevation={0}>
        <Text style={styles.eyebrow}>LEGAL RESOURCES</Text>
        <Text style={styles.heading}>Documentations</Text>
        <View style={styles.headingRule} />
      </Surface>
      <View style={styles.innerContainer}>
        {response?.map((doc, index) => (
          <Pressable
            key={doc.id}
            style={({ pressed }) => [
              styles.pressableRow,
              pressed && styles.pressableRowPressed,
            ]}
            onPress={() => {
              console.log("router pushed from item");
              console.log(doc.id);
              router.push({
                pathname: `/docs/list/[id]` as any,
                params: { id: doc.id },
              });
            }}
          >
            <Card mode="outlined" style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.itemNumber}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text style={styles.listItem}>
                  {decode(doc.name) || "Untitled documentation"}
                </Text>
                <Text style={styles.itemArrow}>›</Text>
              </Card.Content>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    alignSelf: "center",
    width: "100%",
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Brand.colors.surface,
  },
  container: {
    width: "100%",
    padding: 22,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  innerContainer: {
    gap: 10,
    width: "100%",
    paddingTop: 16,
    paddingBottom: 40,
  },
  pressableRow: {
    width: "100%",
  },
  pressableRowPressed: {
    opacity: 0.75,
  },
  card: {
    borderRadius: Brand.radius.medium,
    borderColor: Brand.colors.border,
    backgroundColor: Brand.colors.surface,
  },
  cardContent: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  listItem: {
    flex: 1,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  itemNumber: {
    width: 34,
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 17,
  },
  itemArrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    lineHeight: 30,
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
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 29,
    fontWeight: "600",
  },
  eyebrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 12,
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
