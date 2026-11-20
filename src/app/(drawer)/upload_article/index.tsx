import { Brand, Fonts } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Modal, Portal, Text, TextInput } from "react-native-paper";
import { WebView, WebViewMessageEvent } from "react-native-webview";

const CF7_FORM_ID = "11461";
const API_ENDPOINT = `https://www.lawyersnjurists.com/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`;

// Google reCAPTCHA v2 Site Key
const RECAPTCHA_SITE_KEY = "6LfjAKoUAAAAAPWfUlJbXEWVq-BpUKIXe5aRvfAr";

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

const ARTICLE_TYPES = [
  "Bank and financial institutes",
  "Business",
  "Environment and geography",
  "Garments and Textile",
  "General health and medical science",
  "Hotel and tourism",
  "Human Resource and Managment",
  "IT and Software",
  "Law and Ethics",
  "Others",
  "Real estate",
  "Reports on NGO",
  "Science and technology",
  "Social and political science",
];

export default function ArticleSubmissionScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [articleType, setArticleType] = useState(ARTICLE_TYPES[0]);
  const [articleTitle, setArticleTitle] = useState("");
  const [comments, setComments] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const [submitting, setSubmitting] = useState(false);
  const [captchaVisible, setCaptchaVisible] = useState(false);

  // File picker filtered for .docx documents
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        if (!file.name.toLowerCase().endsWith(".docx")) {
          Alert.alert("Invalid File", "Only .docx files are permitted.");
          return;
        }

        setSelectedFile(file);
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick document.");
    }
  };

  const handleInitiateSubmit = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !articleTitle.trim()
    ) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    if (!selectedFile) {
      Alert.alert(
        "Missing File",
        "Please attach your article document (.docx).",
      );
      return;
    }

    setCaptchaVisible(true);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const token = event.nativeEvent.data;
    if (token) {
      setCaptchaVisible(false);
      submitFormWithToken(token);
    }
  };

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

      data.append("Writer-Name", name.trim());
      data.append("Writer-Email", email.trim());
      data.append("Writer-Phone", phone.trim());
      data.append("Atricle-Type", articleType);
      data.append("Article-title", articleTitle.trim());
      data.append("Comments", comments.trim());

      data.append("Article", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      } as any);

      const response = await axios.post(API_ENDPOINT, data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.status === "mail_sent") {
        Alert.alert(
          "Success!",
          response.data.message ||
            "Your article has been submitted successfully.",
        );
        setName("");
        setEmail("");
        setPhone("");
        setArticleTitle("");
        setComments("");
        setSelectedFile(null);
      } else {
        const fieldErrors = response.data?.invalid_fields
          ?.map((field: any) => `• ${field.message}`)
          .join("\n");

        Alert.alert(
          "Submission Failed",
          fieldErrors || response.data?.message || "Please check your inputs.",
        );
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Could not connect to the server. Please check your network connection.";
      Alert.alert("Network Error", errorMsg);
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
        {/* Modern Styled Header */}
        <View style={styles.headingContainer}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons
              name="file-document-edit-outline"
              size={26}
              color="#1e3a8a"
            />
          </View>
          <Text style={styles.heading}>Submit Your Article</Text>
          <Text style={styles.subHeading}>
            Share your expertise and legal insights with our readers
          </Text>
        </View>

        {/* Main Card Wrapper */}
        <View style={styles.formCard}>
          <TextInput
            label="Your Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor="#cbd5e1"
            activeOutlineColor="#1e3a8a"
          />

          <TextInput
            label="Your Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor="#cbd5e1"
            activeOutlineColor="#1e3a8a"
          />

          <TextInput
            label="Your Phone Number *"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            outlineColor="#cbd5e1"
            activeOutlineColor="#1e3a8a"
          />

          <TextInput
            label="Article Title *"
            value={articleTitle}
            onChangeText={setArticleTitle}
            mode="outlined"
            style={styles.input}
            outlineColor="#cbd5e1"
            activeOutlineColor="#1e3a8a"
          />

          {/* Article Type Selection */}
          <Text style={styles.label}>Article Type *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipContainer}
          >
            {ARTICLE_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[styles.chip, articleType === type && styles.activeChip]}
                onPress={() => setArticleType(type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    articleType === type && styles.activeChipText,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            label="Your Comments"
            value={comments}
            onChangeText={setComments}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            outlineColor="#cbd5e1"
            activeOutlineColor="#1e3a8a"
          />

          {/* File Picker Button */}
          <Pressable
            style={[styles.fileButton, selectedFile && styles.fileButtonActive]}
            onPress={handlePickDocument}
          >
            <View style={styles.fileIconWrapper}>
              <MaterialCommunityIcons
                name={selectedFile ? "checkbox-marked-circle" : "file-word"}
                size={22}
                color={selectedFile ? "#16a34a" : "#2563eb"}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.fileButtonTitle}>
                {selectedFile ? "Document Attached" : "Upload Article Document"}
              </Text>
              <Text
                style={[
                  styles.fileButtonSubtitle,
                  selectedFile && styles.fileButtonSubtitleActive,
                ]}
                numberOfLines={1}
              >
                {selectedFile
                  ? selectedFile.name
                  : "Accepts .docx files only *"}
              </Text>
            </View>
          </Pressable>

          <Button
            mode="contained"
            onPress={handleInitiateSubmit}
            disabled={submitting}
            style={styles.submitButton}
            contentStyle={{ paddingVertical: 8 }}
          >
            {submitting ? (
              <ActivityIndicator
                animating={true}
                color="#ffffff"
                size="small"
              />
            ) : (
              <Text style={styles.submitButtonText}>Submit Article</Text>
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
    backgroundColor: Brand.colors.surface,
    padding: 24,
    paddingBottom: 48,
  },
  headingCard: {
    width: "100%",
    padding: 24,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.large,
    marginBottom: 20,
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
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 13,
    color: Brand.colors.primaryLight || "#64748b",
    fontFamily: Fonts?.sans,
  },
  formCard: {
    width: "100%",
    backgroundColor: Brand.colors.surface,
    borderRadius: Brand.radius.large,
    padding: 20,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.colors.inkSoft || "#334155",
    fontFamily: Fonts?.sans,
    marginTop: 6,
    marginBottom: 8,
  },
  input: {
    marginBottom: 14,
    backgroundColor: "#ffffff",
    fontSize: 14,
    fontFamily: Fonts?.sans,
  },
  chipContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  activeChip: {
    backgroundColor: Brand.colors.primary,
    borderColor: Brand.colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Brand.colors.inkSoft || "#475569",
    fontFamily: Fonts?.sans,
    fontWeight: "500",
  },
  activeChipText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Brand.colors.border,
    borderStyle: "dashed",
    borderRadius: Brand.radius.medium,
    padding: 14,
    marginVertical: 12,
    backgroundColor: Brand.colors.background,
  },
  fileButtonActive: {
    borderColor: Brand.colors.primary,
    backgroundColor: Brand.colors.surface,
    borderStyle: "solid",
  },
  fileIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: Brand.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  fileButtonTitle: {
    color: Brand.colors.ink,
    fontFamily: Fonts?.sans,
    fontWeight: "600",
    fontSize: 13,
  },
  fileButtonSubtitle: {
    color: Brand.colors.muted || "#64748b",
    fontFamily: Fonts?.sans,
    fontSize: 12,
    marginTop: 2,
  },
  fileButtonSubtitleActive: {
    color: Brand.colors.primary,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: Brand.colors.primary,
    borderRadius: Brand.radius.medium,
  },
  submitButtonText: {
    color: "#ffffff",
    fontFamily: Fonts?.sans,
    fontWeight: "700",
    fontSize: 15,
  },
  modalContainer: {
    backgroundColor: Brand.colors.surface,
    marginHorizontal: 20,
    height: 380,
    borderRadius: Brand.radius.large,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: Fonts?.serif,
    fontWeight: "700",
    color: Brand.colors.ink,
  },
});
