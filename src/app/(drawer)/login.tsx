import { login } from "@/api/login";
import { Brand, Fonts } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore"; // Adjust path based on your folder structure
import { useRouter } from "expo-router";
import { useState } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  HelperText,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  // Form State
  const [identifier, setIdentifier] = useState(""); // Email or Username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI & Network State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Client-side Validation Checks
  const hasIdentifierError = () => identifier.trim() === "";
  const hasPasswordError = () => password.trim() === "";

  const handleLogin = async () => {
    if (hasIdentifierError() || hasPasswordError()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const { user } = await login(identifier, password);

      setUser({
        id: user.id,
        name: user.name || "User",
        email: user.email,
        phone: "",
        profile_picture: "",
        role: "legal_client",
      });

      router.replace("/(drawer)/profile" as any);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.message) {
        setErrorMessage(data.message);
      } else if (data?.error) {
        setErrorMessage(data.error);
      } else if (data?.detail) {
        setErrorMessage(data.detail);
      } else {
        setErrorMessage(
          "Invalid credentials or network error. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.card} elevation={2}>
          {/* Header */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your account</Text>

          {/* Global Error Notice */}
          {errorMessage ? (
            <HelperText type="error" visible={true} style={styles.globalError}>
              {errorMessage}
            </HelperText>
          ) : null}

          {/* Email or Username Input */}
          <TextInput
            label="Email"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              if (errorMessage) setErrorMessage("");
            }}
            mode="outlined"
            autoCapitalize="none"
            left={<TextInput.Icon icon="account-outline" />}
            style={styles.input}
          />

          {/* Password Input */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage("");
            }}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          {/* Login Action Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Log In
          </Button>

          {/* Link to Register Screen */}
          <View style={styles.registerRow}>
            <Text style={styles.notRegisteredText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push("/register" as any)}>
              <Text style={styles.registerLink}> Register</Text>
            </Pressable>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: Brand.radius.large,
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Brand.colors.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  globalError: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    marginBottom: 14,
    backgroundColor: Brand.colors.background,
  },
  button: {
    marginTop: 10,
    backgroundColor: Brand.colors.ink,
    borderRadius: Brand.radius.medium,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  notRegisteredText: {
    fontSize: 14,
    color: Brand.colors.muted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: Brand.colors.primary,
  },
});
