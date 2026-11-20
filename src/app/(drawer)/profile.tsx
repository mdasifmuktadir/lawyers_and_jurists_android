import { legalApi } from "@/api/legalApi";
import { clearToken, saveToken } from "@/api/session";
import { Brand, Fonts } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

const tabs = ["Profile", "Cases", "Password"];

const ADVISORS_URL =
  "https://www.lawyersnjurists.com/wp-json/wp/v2/advisor?per_page=100&_fields=title,id";

// WordPress titles can contain HTML entities like &amp; or &#8211;
const decodeEntities = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

interface Lawyer {
  id: number;
  name: string;
}

interface Case {
  id: number;
  title?: string;
  case_number?: string;
  status?: string;
  status_label?: string;
  description?: string;
  next_hearing?: string;
  updated_at?: string;
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const [cases, setCases] = useState<Case[]>([]);
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [appointmentDialogVisible, setAppointmentDialogVisible] =
    useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState<number | null>(null);
  const [lawyerDropdownOpen, setLawyerDropdownOpen] = useState(false);
  const [lawyerSearch, setLawyerSearch] = useState("");

  const filteredLawyers = useMemo(() => {
    const query = lawyerSearch.trim().toLowerCase();
    if (!query) return lawyers;
    return lawyers.filter((lawyer) =>
      lawyer.name.toLowerCase().includes(query),
    );
  }, [lawyers, lawyerSearch]);

  const selectTab = (index: number) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: width * index, animated: true });
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveTab(Math.max(0, Math.min(index, tabs.length - 1)));
  };

  const resetPassword = async () => {
    if (!password || password !== confirmation) {
      Alert.alert("Password", "Please enter matching passwords.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password", "Password must be at least 8 characters.");
      return;
    }
    try {
      const res = await legalApi.post("/change-password", { password });
      await saveToken(res.data.token); // old token is invalid after a password change
      setPassword("");
      setConfirmation("");
      Alert.alert("Password", "Password reset successfully.");
    } catch (error: any) {
      Alert.alert(
        "Password",
        error.response?.data?.message || "Unable to reset password.",
      );
    }
  };

  const openAppointmentDialog = async () => {
    setAppointmentDialogVisible(true);
    setSelectedLawyerId(null);
    setLawyerDropdownOpen(false);
    setLawyerSearch("");
    try {
      const response = await axios.get(ADVISORS_URL);
      setLawyers(
        response.data
          .map((a: { id: number; title: { rendered: string } }) => ({
            id: a.id,
            name: decodeEntities(a.title.rendered),
          }))
          .sort((a: Lawyer, b: Lawyer) => a.name.localeCompare(b.name)),
      );
    } catch (error) {
      console.error("Failed to fetch advisors:", error);
      setLawyers([]);
    }
  };

  const cancelAppointmentDialog = () => {
    setAppointmentDialogVisible(false);
    setSelectedLawyerId(null);
    setLawyerDropdownOpen(false);
    setLawyerSearch("");
  };

  const confirmAppointment = async () => {
    if (!selectedLawyerId) {
      Alert.alert("Get Appointment", "Please select a lawyer.");
      return;
    }
    try {
      await legalApi.post("/appointments", { advisor_id: selectedLawyerId });
      setAppointmentDialogVisible(false);
      setSelectedLawyerId(null);
      setLawyerDropdownOpen(false);
      setLawyerSearch("");
      Alert.alert("Get Appointment", "Appointment request sent");
    } catch (error: any) {
      Alert.alert(
        "Get Appointment",
        error.response?.data?.message || "Unable to send appointment request.",
      );
    }
  };

  const logout = async () => {
    await clearToken();
    useAuthStore.getState().logout();
    router.replace("/" as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchCases = async () => {
        try {
          const response = await legalApi.get("/cases");
          setCases(response.data);
        } catch (error) {
          console.error("Failed to fetch cases:", error);
        }
      };

      fetchCases();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() => selectTab(index)}
          >
            <Text
              style={[styles.tabText, activeTab === index && styles.activeText]}
            >
              {tab}
            </Text>
            {activeTab === index && <View style={styles.indicator} />}
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {/* Tab 1: Profile */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.page}
          nestedScrollEnabled
        >
          <Text style={styles.heading}>{user?.name || "Profile"}</Text>
          <Info label="Email" value={user?.email} />
          <Info
            label="Account type"
            value={user?.role === "legal_client" ? "Legal Client" : user?.role}
          />

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={openAppointmentDialog}
          >
            <Text style={styles.buttonText}>Get Appointment</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </Pressable>
        </ScrollView>

        {/* Tab 2: Cases */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.page}
          nestedScrollEnabled
        >
          <Text style={styles.heading}>Cases</Text>
          {cases.length === 0 ? (
            <Text style={styles.value}>No cases to display.</Text>
          ) : (
            cases.map((item) => (
              <View key={item.id} style={styles.caseCard}>
                <Text style={styles.caseTitle}>
                  {item.title || "Untitled case"}
                </Text>
                <Text style={styles.caseMeta}>
                  Status: {item.status_label || item.status || "Unknown status"}
                </Text>
                <Text style={styles.caseDescription}>
                  {item.description || "No description provided."}
                </Text>
                <Text style={styles.caseDetail}>
                  Case number: {item.case_number || "—"}
                </Text>
                <Text style={styles.caseDetail}>
                  Next hearing: {item.next_hearing || "—"}
                </Text>
                <Text style={styles.caseDetail}>
                  Last updated:{" "}
                  {item.updated_at
                    ? new Date(item.updated_at).toLocaleString()
                    : "—"}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Tab 3: Password */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <Text style={styles.heading}>Reset password</Text>
          <TextInput
            style={styles.input}
            placeholder="New password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmation}
            onChangeText={setConfirmation}
          />
          <Pressable style={styles.button} onPress={resetPassword}>
            <Text style={styles.buttonText}>Reset password</Text>
          </Pressable>
        </ScrollView>
      </ScrollView>

      <Modal
        visible={appointmentDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelAppointmentDialog}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.heading}>Choose Lawyer</Text>

            <Pressable
              style={[
                styles.dropdownHeader,
                lawyerDropdownOpen && styles.dropdownHeaderActive,
              ]}
              onPress={() =>
                setLawyerDropdownOpen((open) => {
                  const next = !open;
                  if (!next) setLawyerSearch("");
                  return next;
                })
              }
            >
              <Text
                style={[
                  styles.value,
                  !selectedLawyerId && styles.placeholderValue,
                ]}
              >
                {lawyers.find((lawyer) => lawyer.id === selectedLawyerId)
                  ?.name || "Select a lawyer"}
              </Text>
              <Text style={styles.dropdownChevron}>
                {lawyerDropdownOpen ? "▲" : "▼"}
              </Text>
            </Pressable>

            {lawyerDropdownOpen && (
              <View style={styles.dropdownList}>
                <TextInput
                  style={styles.dropdownSearchInput}
                  placeholder="Search lawyers..."
                  value={lawyerSearch}
                  onChangeText={setLawyerSearch}
                  autoFocus
                />
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  style={styles.dropdownScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredLawyers.length === 0 ? (
                    <Text style={[styles.value, styles.dropdownItem]}>
                      {lawyers.length === 0
                        ? "No lawyers available."
                        : "No lawyers match your search."}
                    </Text>
                  ) : (
                    filteredLawyers.map((lawyer) => (
                      <Pressable
                        key={lawyer.id}
                        style={[
                          styles.dropdownItem,
                          lawyer.id === selectedLawyerId &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedLawyerId(lawyer.id);
                          setLawyerDropdownOpen(false);
                          setLawyerSearch("");
                        }}
                      >
                        <Text
                          style={[
                            styles.value,
                            lawyer.id === selectedLawyerId &&
                              styles.dropdownItemSelectedText,
                          ]}
                        >
                          {lawyer.name}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.button,
                  styles.secondaryButton,
                  styles.modalButton,
                ]}
                onPress={cancelAppointmentDialog}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.modalButton]}
                onPress={confirmAppointment}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.colors.background },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 16 },
  tabText: {
    color: Brand.colors.muted,
    fontWeight: "600",
    fontFamily: Fonts?.sans,
  },
  activeText: { color: Brand.colors.primary },
  indicator: {
    position: "absolute",
    bottom: -1,
    height: 2,
    width: "70%",
    backgroundColor: Brand.colors.primary,
  },
  page: { padding: 24 },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },
  info: { marginBottom: 16 },
  label: { color: Brand.colors.muted, fontSize: 13 },
  value: { marginTop: 4, fontSize: 16, color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 13,
    marginBottom: 14,
  },
  caseCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  caseMeta: {
    fontSize: 12,
    color: Brand.colors.muted,
    marginBottom: 8,
  },
  caseDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  caseDetail: {
    fontSize: 14,
    color: "#374151",
    marginTop: 6,
    lineHeight: 20,
  },
  lawyerHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginTop: 14,
    marginBottom: 2,
  },
  button: {
    backgroundColor: Brand.colors.ink,
    borderRadius: Brand.radius.medium,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    backgroundColor: Brand.colors.primary,
    marginBottom: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 13,
    marginBottom: 8,
  },
  dropdownHeaderActive: {
    borderColor: Brand.colors.primary,
  },
  placeholderValue: {
    color: "#9ca3af",
  },
  dropdownChevron: {
    color: Brand.colors.muted,
    fontSize: 12,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 14,
    maxHeight: 220,
    overflow: "hidden",
  },
  dropdownSearchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 13,
    fontSize: 15,
    backgroundColor: "#f9fafb",
  },
  dropdownScroll: {
    maxHeight: 176,
  },
  dropdownItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dropdownItemSelected: {
    backgroundColor: "#eff6ff",
  },
  dropdownItemSelectedText: {
    color: Brand.colors.primary,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 0,
  },
});
