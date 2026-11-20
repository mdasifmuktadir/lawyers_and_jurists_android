import { Brand } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import { Carousel } from "react-native-reanimated-carousel";

interface ImageItem {
  id: string;
  image: any;
  title: string;
  subtitle: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const LOCAL_CAROUSEL_IMAGES: ImageItem[] = [
  {
    id: "1",
    image: require("@/assets/images/hero-1.jpg"),
    title: "The Lawyers & Jurists",
    subtitle: "Strategic advocacy & boardroom arbitration",
  },
  {
    id: "2",
    image: require("@/assets/images/hero-2.jpg"),
    title: "Unmatched Legal Research",
    subtitle: "Backed by comprehensive statutory repositories",
  },
  {
    id: "3",
    image: require("@/assets/images/hero-3.jpg"),
    title: "Modern Legal Infrastructure",
    subtitle: "Designed for seamless client consultations",
  },
  {
    id: "4",
    image: require("@/assets/images/hero-4.jpg"),
    title: "Welcome to Excellence",
    subtitle: "Dedicated to justice, integrity & legal ethics",
  },
  {
    id: "5",
    image: require("@/assets/images/hero-5.jpg"),
    title: "Extensive Case Law Archives",
    subtitle: "Deep legal knowledge driving successful outcomes",
  },
  {
    id: "6",
    image: require("@/assets/images/hero-6.jpg"),
    title: "Client-Centric Practice",
    subtitle: "Professional guidance at every legal milestone",
  },
  {
    id: "7",
    image: require("@/assets/images/hero-7.jpg"),
    title: "Senior Partner Chambers",
    subtitle: "Expert litigation & corporate advisory",
  },
  {
    id: "8",
    image: require("@/assets/images/hero-8.jpg"),
    title: "High-Stakes Negotiations",
    subtitle: "Precision and authority in complex disputes",
  },
  {
    id: "9",
    image: require("@/assets/images/hero-9.jpg"),
    title: "Dedicated Legal Team",
    subtitle: "Collaborative research and case preparation",
  },
  {
    id: "10",
    image: require("@/assets/images/hero-10.jpg"),
    title: "Courtroom Preparedness",
    subtitle: "Rigorous attention to detail and case drafting",
  },
];

export default function ImageCarousel() {
  return (
    <View style={styles.container}>
      <Carousel
        loop={true}
        style={{ width: SCREEN_WIDTH, height: 230 }}
        autoplay={true}
        autoplayInterval={4000}
        data={LOCAL_CAROUSEL_IMAGES}
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-10, 10]);
        }}
        renderItem={({ item }) => (
          <Surface style={styles.cardFrame} elevation={2}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Elegant Dark Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.85)"]}
              style={styles.gradientOverlay}
            >
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </LinearGradient>
          </Surface>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardFrame: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "65%",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  textContainer: {
    borderLeftWidth: 3,
    borderLeftColor: Brand?.primary || "#C5A059", // Gold/Primary Accent Bar
    paddingLeft: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#E0E0E0",
    fontSize: 12,
    fontWeight: "400",
    marginTop: 2,
  },
});
