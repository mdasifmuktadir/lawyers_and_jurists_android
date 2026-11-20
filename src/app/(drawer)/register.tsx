import { LEGAL_API_URL } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

type Step = "details" | "verify";

export default function RegisterScreen() {
  const router = useRouter();

  // Step & Form State
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password Visibility Toggle State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback State
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const getApiErrorMessage = (err: any, fallback: string) => {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    return fallback;
  };

  const validateDetails = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    return true;
  };

  // Step 1: Request verification code via email
  const handleSendCode = async (isResend = false) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!isResend) {
      if (!validateDetails()) return;
    } else if (resendCooldown > 0) {
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${LEGAL_API_URL}/register/request-otp`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        { timeout: 15000 },
      );

      setStep("verify");
      setResendCooldown(60);
      setSuccessMessage(
        isResend
          ? "A new verification code has been sent to your email."
          : "Verification code sent! Check your email inbox or spam folder.",
      );
    } catch (err: any) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Failed to send verification code. Please check your connection.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit code with registration details to create account
  const handleVerifyAndRegister = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${LEGAL_API_URL}/register`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          code: cleanCode,
        },
        { timeout: 15000 },
      );

      setRegistered(true);
      setSuccessMessage(
        "Account verified and registered! Redirecting to login...",
      );
      setTimeout(() => {
        router.replace("/login" as any);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Verification failed. Please check the code and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setCode("");
    setErrorMessage("");
    setSuccessMessage("");
    setRegistered(false);
    setResendCooldown(0);
    setStep("details");
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
          <Text style={styles.title}>
            {step === "details" ? "Create Account" : "Verify Email"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "details"
              ? "Sign up to get started"
              : `Enter the 6-digit code sent to ${email.trim().toLowerCase()}`}
          </Text>

          {/* Success Banner */}
          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {errorMessage ? (
            <HelperText type="error" visible={true} style={styles.globalError}>
              {errorMessage}
            </HelperText>
          ) : null}

          {step === "details" ? (
            <>
              {/* Full Name Input */}
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errorMessage) setErrorMessage("");
                }}
                mode="outlined"
                left={<TextInput.Icon icon="account-outline" />}
                style={styles.input}
              />

              {/* Email Input */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage("");
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email-outline" />}
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

              {/* Retype Password Input */}
              <TextInput
                label="Retype Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage("");
                }}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                left={<TextInput.Icon icon="lock-check-outline" />}
                right={
                  <TextInput.Icon
                    icon={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
              />

              {/* Send Code Button */}
              <Button
                mode="contained"
                onPress={() => handleSendCode(false)}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              {/* 6-Digit Verification Code Input */}
              <TextInput
                label="6-Digit Verification Code"
                value={code}
                onChangeText={(text) => {
                  setCode(text.replace(/[^0-9]/g, "").slice(0, 6));
                  if (errorMessage) setErrorMessage("");
                }}
                mode="outlined"
                keyboardType="number-pad"
                maxLength={6}
                left={<TextInput.Icon icon="shield-check-outline" />}
                style={[styles.input, styles.codeInput]}
              />

              {/* Verify & Register Button */}
              <Button
                mode="contained"
                onPress={handleVerifyAndRegister}
                loading={loading}
                disabled={loading || registered}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Verify & Register
              </Button>

              {/* Resend & Edit Email Actions */}
              <View style={styles.secondaryActions}>
                <Pressable
                  onPress={() => handleSendCode(true)}
                  disabled={loading || resendCooldown > 0 || registered}
                >
                  <Text
                    style={[
                      styles.actionLink,
                      resendCooldown > 0 && styles.disabledText,
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : "Resend Code"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleChangeEmail}
                  disabled={loading || registered}
                >
                  <Text style={styles.mutedActionText}>Change Email</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Redirect Link to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.alreadyRegisteredText}>
              Already registered?
            </Text>
            <Pressable onPress={() => router.push("/login" as any)}>
              <Text style={styles.loginLink}> Log In</Text>
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
  successContainer: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  successText: {
    color: "#2e7d32",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  globalError: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    marginBottom: 14,
    backgroundColor: "#ffffff",
  },
  codeInput: {
    letterSpacing: 6,
  },
  button: {
    marginTop: 10,
    backgroundColor: Brand.colors.ink,
    borderRadius: Brand.radius.medium,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  actionLink: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.colors.primary,
  },
  mutedActionText: {
    fontSize: 14,
    color: Brand.colors.muted,
  },
  disabledText: {
    color: Brand.colors.muted,
    opacity: 0.6,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  alreadyRegisteredText: {
    fontSize: 14,
    color: Brand.colors.muted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: Brand.colors.primary,
  },
});
