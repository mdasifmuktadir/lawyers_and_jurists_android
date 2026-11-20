import { Brand, Fonts } from "@/constants/theme";
import { decode } from "html-entities";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

const membersOfList = [
  {
    image_url: "https://www.lawyersnjurists.com/wp-content/uploads/logo.jpg",
    link: "https://www.lincolnsinn.org.uk/",
    name: "Lincoln's Inn",
  },
  {
    image_url:
      "https://www.lawyersnjurists.com/wp-content/uploads/PraeLegal-Logo-240px.png",
    link: "http://www.praelegal.de",
    name: "Prae Legal",
  },
  {
    image_url:
      "https://www.lawyersnjurists.com/wp-content/uploads/sticky-logo.png",
    link: "https://www.icc-cpi.int/",
    name: "International Criminal Court",
  },
  {
    image_url:
      "https://www.lawyersnjurists.com/wp-content/uploads/ciarb-logo-red.png",
    link: "http://www.ciarb.org/",
    name: "Chartered Institute of Arbitrators",
  },
];

export default function MembersOf() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async (url: string) => {
    // 1. Check if the device can open the URL
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // 2. Open the link in the device's default browser
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.stateText}>Loading memberships...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, styles.carouselContainer]}>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error || "No memberships found."}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.eyebrow}>PROFESSIONAL AFFILIATIONS</Text>
        <Text style={styles.heading}>Members Of</Text>
        <View style={styles.headingRule} />
      </View>

      <View style={styles.content}>
        {membersOfList.map((member, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.innerContent,
              pressed && styles.memberPressed,
            ]}
            onPress={() => handlePress(member.link)}
            accessibilityRole="link"
            accessibilityLabel={`Visit member`}
          >
            <Image source={{ uri: member.image_url }} style={styles.image} />
            <Text style={styles.memberTitle}>{decode(member.name)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 24,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
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
  innerContent: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.surface,
    padding: 18,
  },
  memberPressed: {
    opacity: 0.72,
  },
  image: {
    width: "100%", // Mandatory
    height: 100, // Mandatory
    resizeMode: "contain",
  },
  content: {
    gap: 10,
    justifyContent: "center",
  },
  headingContainer: {
    marginBottom: 18,
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
    fontSize: 28,
    fontWeight: "600",
  },
  memberTitle: {
    marginTop: 12,
    color: Brand.colors.inkSoft,
    fontFamily: Fonts?.sans,
    fontSize: 15,
    textAlign: "center",
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
