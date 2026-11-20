import { API_BASE_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { useRouter } from "expo-router";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
export default function OurServices() {
  const [response, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 2. Set up an AbortController to cancel requests if component unmounts mid-fetch
    const source = axios.CancelToken.source();

    async function fetchServices() {
      try {
        // 3. Make the API call using Axios
        const response = await axios.get(
          API_BASE_URL + "posts?categories=2&_fields=title,id",
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

    fetchServices();

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
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.eyebrow}>LEGAL EXPERTISE</Text>
        <Text style={styles.heading}>Our Services</Text>
        <View style={styles.headingRule} />
      </View>
      <View style={styles.container}>
        {response.map((service, index) => (
          <Pressable
            key={service.id}
            style={({ pressed }) => [
              styles.serviceRow,
              pressed && styles.serviceRowPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/services/[id]" as any,
                params: { id: service.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`View ${service.title || "legal service"}`}
          >
            <Text style={styles.serviceNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.serviceTitle}>
              {decode(service.title.rendered) || "Untitled service"}
            </Text>
            <Text style={styles.serviceArrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    padding: 24,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  headingContainer: {
    marginBottom: 18,
  },
  eyebrow: {
    color: Brand.colors.primary,
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heading: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    fontSize: 28,
    fontWeight: "600",
  },
  headingRule: {
    width: 44,
    height: 2,
    backgroundColor: Brand.colors.primary,
    marginTop: 12,
  },
  container: {
    gap: 10,
  },
  serviceRow: {
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
  serviceRowPressed: {
    opacity: 0.72,
  },
  serviceNumber: {
    width: 34,
    color: Brand.colors.primary,
    fontFamily: Fonts?.serif,
    fontSize: 17,
  },
  serviceTitle: {
    flex: 1,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  serviceArrow: {
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
  stateText: {
    marginTop: 10,
    color: Brand.colors.muted,
  },
  errorText: {
    color: Brand.colors.error,
    textAlign: "center",
  },
});
