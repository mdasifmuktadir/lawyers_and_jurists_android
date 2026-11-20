import Drawer from "@/components/Drawer";
import { Brand, Fonts } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Slot, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const primaryRoutes: {
  label: string;
  route: string;
  icon: IconName;
}[] = [
  { label: "Home", route: "/", icon: "home-outline" },
  { label: "Services", route: "/our_services", icon: "briefcase-outline" },
  { label: "About Us", route: "/about_us", icon: "information-outline" },
];

const extraRoutes: {
  label: string;
  route: string;
  icon: IconName;
}[] = [
  { label: "Clients", route: "/our_clients", icon: "account-group-outline" },
  { label: "Lawyers", route: "/our_lawyers", icon: "scale-balance" },
  {
    label: "Apply For Internship",
    route: "/internship",
    icon: "school-outline",
  },
  {
    label: "Apply As An In-House Lawyer",
    route: "/inhouse_lawyer",
    icon: "account-tie-outline",
  },
  {
    label: "Gallery",
    route: "/gallery",
    icon: "image-multiple-outline",
  },
  {
    label: "Videos",
    route: "/videos",
    icon: "video-outline",
  },
  {
    label: "Upload Article",
    route: "/upload_article",
    icon: "upload",
  },
  { label: "Contact", route: "/contact_us", icon: "phone-outline" },
];

const socialMediaLinks: {
  name: string;
  icon: IconName;
  url: string;
  size?: number;
}[] = [
  {
    name: "Facebook",
    icon: "facebook",
    url: "https://www.facebook.com/Lawyersandjurists",
  },
  {
    name: "X",
    icon: "alpha-x",
    url: "https://x.com/lawforpeople",
    size: 27,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    url: "https://www.linkedin.com/in/tjurists",
  },
  {
    name: "YouTube",
    icon: "youtube",
    url: "https://www.youtube.com/channel/UCJISzyhOtpZjm6Zt7pM9wlw",
  },
  {
    name: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com/the_lawyers_and_jurists_?igshid=YmMyMTA2M2Y%3D",
  },
];

const initialSearchForm = {
  title: "",
  phrase: "",
  subject: "",
  casetype: "",
  year: "",
  appellant: "",
  respondent: "",
  relevvant_law: "",
  relevvant_section: "",
  court: "",
  citation: "",
  judge: "",
  advocate: "",
  delivery_date_from: "",
  delivery_date_to: "",
};

// Layout constants
const BOTTOM_BAR_HEIGHT = 70;
const TOP_BAR_CONTENT_HEIGHT = 150;
const HEADER_GAP = 12; // guaranteed space between logo and login / avatar

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function DrawerLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const [expanded, setExpanded] = useState(false);

  // Search Drawer State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchForm, setSearchForm] = useState(initialSearchForm);

  // Responsive sizing: everything in the header scales with screen width
  const logoHeight = clamp(width * 0.1, 30, 46);
  const loginFontSize = clamp(width * 0.03, 10, 13);
  const loginIconSize = clamp(width * 0.036, 12, 16);
  const loginPaddingH = clamp(width * 0.026, 8, 14);
  const loginPaddingV = clamp(width * 0.016, 6, 9);
  const avatarSize = clamp(width * 0.09, 32, 42);

  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";

  const navigate = (route: string) => {
    setExpanded(false);
    router.push(route as never);
  };

  const handleInputChange = (
    field: keyof typeof initialSearchForm,
    value: string,
  ) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarMain}>
          {/* Logo: takes all remaining width and scales to fit */}
          <Pressable
            onPress={() => navigate("/")}
            style={[styles.logoContainer, { height: logoHeight }]}
          >
            <Image
              source={require("../../../assets/splash_logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Pressable>

          {/* Login / Avatar: keeps its natural size, never shrinks */}
          <View style={styles.accountSlot}>
            {user ? (
              <Pressable onPress={() => navigate("/profile")}>
                <View
                  style={[
                    styles.avatar,
                    {
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: avatarSize / 2,
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user.name)}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.loginButton,
                  {
                    paddingHorizontal: loginPaddingH,
                    paddingVertical: loginPaddingV,
                  },
                ]}
                onPress={() => navigate("/login")}
              >
                <MaterialCommunityIcons
                  name="login"
                  size={loginIconSize}
                  color="#FFFFFF"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[styles.loginText, { fontSize: loginFontSize }]}
                  numberOfLines={1}
                >
                  Client Login
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.socialBar}>
          {socialMediaLinks.map((item) => (
            <Pressable
              key={item.name}
              style={styles.socialIconContainer}
              onPress={() => Linking.openURL(item.url)}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={item.size ?? 22}
                color={Brand.colors.primary}
              />
            </Pressable>
          ))}
        </View>

        {/* Attractive Full-Width Search Button */}
        {!isSearchOpen && (
          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
            onPress={() => setIsSearchOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.searchButtonText}>
              Search Legal Database & Cases
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main Content */}
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + TOP_BAR_CONTENT_HEIGHT,
            paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT,
          },
        ]}
      >
        <Slot />
      </View>

      {/* Sliding Search Drawer Modal */}
      <Drawer
        isSearchOpen={isSearchOpen}
        handleInputChange={handleInputChange}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Expanded Menu */}
      {expanded && (
        <View
          style={[
            styles.expandedMenu,
            { bottom: insets.bottom + BOTTOM_BAR_HEIGHT },
          ]}
        >
          <Text style={styles.menuTitle}>More</Text>

          <ScrollView>
            <View style={styles.routeGrid}>
              {extraRoutes.map((item) => (
                <Pressable
                  key={item.route}
                  style={styles.extraItem}
                  onPress={() => navigate(item.route)}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={23}
                    color={Brand.colors.primary}
                  />
                  <Text style={styles.extraLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Bottom Bar Navigation */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        {primaryRoutes.map((item) => (
          <Pressable
            key={item.route}
            style={styles.bottomItem}
            onPress={() => navigate(item.route)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={Brand.colors.primary}
            />
            <Text style={styles.bottomLabel}>{item.label}</Text>
          </Pressable>
        ))}

        <Pressable
          style={styles.bottomItem}
          onPress={() => setExpanded((value) => !value)}
        >
          <MaterialCommunityIcons
            name={expanded ? "close" : "menu"}
            size={24}
            color={Brand.colors.primary}
          />
          <Text style={styles.bottomLabel}>More</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.surface,
  },
  content: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    minHeight: TOP_BAR_CONTENT_HEIGHT,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Brand.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  topBarMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: HEADER_GAP,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  accountSlot: {
    flexShrink: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  socialBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    width: "100%",
  },
  socialIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.colors.primary,
    borderRadius: Brand.radius.medium,
    marginTop: 8,
    paddingHorizontal: 16,
    height: 42,
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.colors.ink,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.primary,
  },
  loginText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    minHeight: BOTTOM_BAR_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Brand.colors.background,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
  },
  bottomItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  bottomLabel: {
    marginTop: 3,
    fontSize: 11,
    color: Brand.colors.primary,
  },
  expandedMenu: {
    position: "absolute",
    left: 12,
    right: 12,
    maxHeight: 320,
    zIndex: 15,
    padding: 16,
    borderRadius: Brand.radius.large,
    backgroundColor: Brand.colors.background,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
  },
  routeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  extraItem: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 12,
  },
  extraLabel: {
    marginTop: 5,
    fontSize: 11,
    textAlign: "center",
    color: Brand.colors.inkSoft,
  },
});
