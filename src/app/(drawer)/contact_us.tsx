import { Brand } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { WebView, WebViewMessageEvent } from "react-native-webview";

const OFFICE_LOCATION = {
  latitude: 23.738932789332658,
  longitude: 90.41591488675397,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

const CF7_FORM_ID = "123";

// Google reCAPTCHA v2 Site Key (replace with your site key)
const RECAPTCHA_SITE_KEY = "6LfjAKoUAAAAAPWfUlJbXEWVq-BpUKIXe5aRvfAr";

// Injected HTML rendered directly inside the WebView Modal
const RECAPTCHA_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: #ffffff;
      }
    </style>
  </head>
  <body>
    <div class="g-recaptcha" data-sitekey="${RECAPTCHA_SITE_KEY}" data-callback="onSuccess"></div>
    <script>
      function onSuccess(token) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(token);
        }
      }
    </script>
  </body>
</html>
`;

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactUsScreen() {
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [captchaVisible, setCaptchaVisible] = useState<boolean>(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenMap = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${OFFICE_LOCATION.latitude},${OFFICE_LOCATION.longitude}`,
      android: `geo:0,0?q=${OFFICE_LOCATION.latitude},${OFFICE_LOCATION.longitude}(The Lawyers & Jurists)`,
    });
    if (url) Linking.openURL(url);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Step A: Trigger Modal opening on form validation success
  const handleInitiateSubmit = () => {
    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      Alert.alert(
        "Required Fields Missing",
        "Please fill in all mandatory fields.",
      );
      return;
    }

    setCaptchaVisible(true);
  };

  // Step B: Receive token directly from in-app WebView
  const handleMessage = (event: WebViewMessageEvent) => {
    const token = event.nativeEvent.data;
    if (token) {
      setCaptchaVisible(false);
      submitFormWithToken(token);
    }
  };

  // Step C: Send payload directly to CF7 REST API
  const submitFormWithToken = async (recaptchaToken: string) => {
    setSubmitting(true);

    try {
      const data = new FormData();

      data.append("_wpcf7", CF7_FORM_ID);
      data.append("_wpcf7_version", "5.8");
      data.append("_wpcf7_locale", "en_US");
      data.append("_wpcf7_unit_tag", `wpcf7-f${CF7_FORM_ID}-p1-o1`);

      data.append("g-recaptcha-response", recaptchaToken);
      data.append("_wpcf7_recaptcha_response", recaptchaToken);

      data.append("text-538", formData.full_name.trim());
      data.append("email-959", formData.email.trim());
      data.append("tel-620", formData.phone.trim());
      data.append("text-5381", formData.subject.trim());
      data.append("textarea-434", formData.message.trim());

      const cf7Endpoint = `https://www.lawyersnjurists.com/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`;

      const response = await axios.post(cf7Endpoint, data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.status === "mail_sent") {
        Alert.alert(
          "Message Sent",
          response.data.message || "Thank you for reaching out!",
        );
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        const fieldErrors = response.data?.invalid_fields
          ?.map((field: any) => `• ${field.message}`)
          .join("\n");

        Alert.alert(
          "Validation Error",
          fieldErrors || response.data?.message || "Please check your inputs.",
        );
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to send message. Please check your network or server configuration.";
      Alert.alert("Submission Error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>CONTACT US</Text>
        </View>

        {/* Location Info */}
        <Pressable style={styles.locationCard} onPress={handleOpenMap}>
          <View style={styles.locationIcon}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={28}
              color={Brand.colors.primary}
            />
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationEyebrow}>VISIT OUR OFFICE</Text>
            <Text style={styles.locationTitle}>The Lawyers & Jurists</Text>
            <Text style={styles.locationValue}>
              M L Village (3rd Floor), 147 Shantinagar, Dhaka - 1217
            </Text>
            <Text style={styles.locationAction}>Open in Maps ›</Text>
          </View>
        </Pressable>

        {/* Contact Information Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>

          <Pressable style={styles.infoRow} onPress={handleOpenMap}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={26}
              color={Brand.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                M L Village (3rd Floor), 147 Shantinagar, Dhaka - 1217
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.infoRow}
            onPress={() => handleEmailPress("info@lawyersnjurists.com")}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={26}
              color={Brand.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>info@lawyersnjurists.com</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.infoRow}
            onPress={() => handlePhonePress("+88029571338")}
          >
            <MaterialCommunityIcons
              name="phone-outline"
              size={26}
              color={Brand.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Telephone</Text>
              <Text style={styles.infoValue}>+880-2-9571338</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.infoRow}
            onPress={() => handlePhonePress("+8801713044057")}
          >
            <MaterialCommunityIcons
              name="cellphone"
              size={26}
              color={Brand.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Cell</Text>
              <Text style={styles.infoValue}>+880-1713044057</Text>
            </View>
          </Pressable>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>

          <TextInput
            label="Full Name *"
            value={formData.full_name}
            onChangeText={(val) => handleInputChange("full_name", val)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(val) => handleInputChange("email", val)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(val) => handleInputChange("phone", val)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Subject *"
            value={formData.subject}
            onChangeText={(val) => handleInputChange("subject", val)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Message *"
            value={formData.message}
            onChangeText={(val) => handleInputChange("message", val)}
            mode="outlined"
            multiline
            numberOfLines={5}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleInitiateSubmit}
            disabled={submitting}
            style={styles.submitButton}
            contentStyle={{ paddingVertical: 6 }}
          >
            {submitting ? (
              <ActivityIndicator
                animating={true}
                color="#ffffff"
                size="small"
              />
            ) : (
              "Send Message"
            )}
          </Button>
        </View>
      </ScrollView>

      {/* Embedded reCAPTCHA Modal */}
      <Portal>
        <Modal
          visible={captchaVisible}
          onDismiss={() => setCaptchaVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Verification</Text>
            <Pressable onPress={() => setCaptchaVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </Pressable>
          </View>
          <WebView
            originWhitelist={["*"]}
            source={{
              html: RECAPTCHA_HTML,
              baseUrl: "https://www.lawyersnjurists.com",
            }}
            onMessage={handleMessage}
            style={{ flex: 1 }}
          />
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#ffffff",
    paddingBottom: 40,
  },
  headingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#111111",
    borderBottomWidth: 2,
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    paddingBottom: 15,
    textAlign: "center",
  },
  locationCard: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    padding: 18,
    marginBottom: 25,
    backgroundColor: Brand.colors.surface,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
  },
  locationIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: 22,
  },
  locationContent: {
    flex: 1,
    marginLeft: 14,
  },
  locationEyebrow: {
    color: Brand.colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  locationTitle: {
    color: Brand.colors.ink,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 4,
  },
  locationValue: {
    color: Brand.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  locationAction: {
    color: Brand.colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  infoSection: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111111",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Brand.colors.muted,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    color: "#222222",
    fontWeight: "500",
    marginTop: 2,
  },
  formSection: {
    width: "90%",
    alignSelf: "center",
  },
  input: {
    marginBottom: 14,
    backgroundColor: "#ffffff",
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: Brand.colors.ink,
    borderRadius: Brand.radius.medium,
  },
  modalContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    height: 360,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
