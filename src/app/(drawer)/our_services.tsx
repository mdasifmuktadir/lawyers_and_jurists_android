import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { router } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function OurServicesPage() {
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
          API_BASE_URL + "posts?categories=2&_fields=id,title&per_page=50",
        );

        // Axios stores parsed JSON data inside the '.data' property automatically
        console.log("our services data");
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
        <Text style={styles.stateText}>Loading services...</Text>
      </View>
    );
  }

  if (error || !response || response.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No services found."}
        </Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.main}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>LEGAL EXPERTISE</Text>
        <Text style={styles.heading}>Our Services</Text>
        <View style={styles.headingRule} />
      </View>
      <View style={styles.innerContainer}>
        {response.map((service, index) => (
          <Pressable
            style={({ pressed }) => [
              styles.listItem,
              pressed && styles.listItemPressed,
            ]}
            key={service.id}
            onPress={() =>
              router.push({
                pathname: "/services/[id]" as any,
                params: { id: service.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`View ${service.title.rendered || "service"}`}
          >
            <Text style={styles.itemNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.itemTitle}>
              {decode(service.title.rendered) || "Untitled service"}
            </Text>
            <Text style={styles.itemArrow}>›</Text>
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
    padding: 24,
    paddingBottom: 48,
    backgroundColor: Brand.colors.surface,
  },
  container: {
    width: "100%",
    padding: 24,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  innerContainer: {
    gap: 10,
    width: "100%",
    paddingBottom: 40,
  },
  listItem: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.surface,
  },
  listItemPressed: {
    opacity: 0.72,
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
    fontSize: 30,
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
  itemNumber: {
    width: 34,
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 17,
  },
  itemTitle: {
    flex: 1,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  itemArrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    lineHeight: 30,
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
