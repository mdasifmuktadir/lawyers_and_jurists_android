import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
// 1. Import Axios
import { API_BASE_URL } from "@/config/apiUrls";
import axios from "axios";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
// 1. Import Axios

export default function OurClientsPage() {
  const [response, setResponses] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async (url: string) => {
    // Check if the link can be opened by the system
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opens the link in the device's default browser (Safari / Chrome)
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  useEffect(() => {
    // 2. Set up an AbortController to cancel requests if component unmounts mid-fetch
    const source = axios.CancelToken.source();

    async function fetchImages() {
      try {
        // 3. Make the API call using Axios
        const response = await axios.get(
          API_BASE_URL +
            "posts?categories=4&per_page=100&_fields=id,title,featured_image_url",
          {
            cancelToken: source.token,
          },
        );

        // Axios stores parsed JSON data inside the '.data' property automatically
        setResponses(response.data);
        console.log(response.data);
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
        <Text style={{ marginTop: 10 }}>Loading Client Gallery...</Text>
      </View>
    );
  }

  if (error || response?.length === 0) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={{ color: "red" }}>
          {error || "No images found."}
        </Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.main}>
      <View style={styles.container}>
        <Text style={styles.heading}>Our Clients</Text>

        <Text style={styles.descriptionText}>
          ‘The Lawyers & Jurists’ is one of the largest law firm in Bangladesh.
          Provides a comprehensive range of legal services to both national and
          international clients. The members of the company act as a cohesive
          team and actively cooperate with advice and cases when the need
          arises. The strength of a company is not only the breadth of personal
          information available, but also almost every year the experience of
          counseling and litigation in key areas of work. The firm’s attorneys
          have experience working with companies namely:
        </Text>
      </View>
      <View style={styles.innerContainer}>
        {response?.map((client, key) => (
          <Pressable
            key={client.id}
            onPress={() => handlePress(client.website)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed, // Visual feedback on press
            ]}
          >
            <View style={styles.imageCard}>
              <Image
                source={{ uri: client.featured_image_url }}
                style={styles.image}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    alignSelf: "center",
    paddingTop: 30,
    marginBottom: 40,
  },
  container: {
    width: "100%",
    gap: 20,
    padding: 30,
  },

  card: {
    width: "100%",
    padding: 20,

    borderRadius: 10,
    alignItems: "center",
  },
  cardPressed: {
    opacity: 0.8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26, // Increases line spacing (26px height per line)
    color: "#1A1A1A",
  },
  innerContainer: {
    gap: 15,
    width: "80%",
    paddingBottom: 100,
    alignSelf: "center",
  },
  imageCard: {
    height: 300,
    width: 300,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    alignSelf: "center",
  },
  image: {
    objectFit: "contain",
    height: "80%",
    width: "80%",
    alignSelf: "center",
  },

  carouselContainer: {
    height: 220,
    width: "100%",
    backgroundColor: "#E8DCCF",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 40,
    paddingBottom: 20,
  },
  buttonHovered: {
    color: "red",
  },
});
