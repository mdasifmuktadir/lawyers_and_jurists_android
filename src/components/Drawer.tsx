import { lawyer_ci_url } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

// Autocomplete tuning
const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const MAX_SUGGESTIONS = 20;

export const initialSearchForm = {
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
  case_no: "",
};

export type SearchFormField = keyof typeof initialSearchForm;

// Map each field to its specific backend endpoint route
const FIELD_ENDPOINTS: Record<SearchFormField, string> = {
  title: `${lawyer_ci_url}/auto_title_search`,
  phrase: `${lawyer_ci_url}/suggestions/phrases`,
  subject: `${lawyer_ci_url}/auto_subject_search`,
  casetype: `${lawyer_ci_url}/suggestions/casetypes`,
  year: `${lawyer_ci_url}/suggestions/years`,
  appellant: `${lawyer_ci_url}/auto_appellant_search`,
  respondent: `${lawyer_ci_url}/auto_respondent_search`,
  relevvant_law: `${lawyer_ci_url}/auto_relevvant_law_search`,
  relevvant_section: `${lawyer_ci_url}/auto_relevvant_section_search`,
  court: `${lawyer_ci_url}/auto_court_search`,
  citation: `${lawyer_ci_url}/auto_citation_search`,
  judge: `${lawyer_ci_url}/auto_judge_search`,
  advocate: `${lawyer_ci_url}/auto_advocate_search`,
  delivery_date_from: `${lawyer_ci_url}/auto_delivery_date_from_search`,
  delivery_date_to: `${lawyer_ci_url}/suggestions/delivery-dates`,
  case_no: `${lawyer_ci_url}/auto_case_no_search`,
};

interface DrawerProps {
  isSearchOpen: boolean;
  onClose: () => void;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export default function Drawer({ isSearchOpen, onClose }: DrawerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [searchForm, setSearchForm] = useState(initialSearchForm);

  // Auto-complete suggestion state
  const [activeField, setActiveField] = useState<SearchFormField | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Position & layout tracking
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
  const inputRefs = useRef<Partial<Record<SearchFormField, View>>>({});

  // In-flight request tracking so a slow older request can't overwrite a newer one
  const abortRef = useRef<AbortController | null>(null);

  // Cache of "field:term" -> suggestions, so backspacing/retyping is instant
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  // Slide-in animation
  useEffect(() => {
    if (isSearchOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSearchOpen, slideAnim, fadeAnim]);

  // Recalculate dropdown floating coordinates. Only called from focus/scroll,
  // NOT on every keystroke, since measureInWindow is a native bridge round trip.
  const updateDropdownPosition = useCallback((field: SearchFormField) => {
    const inputContainer = inputRefs.current[field];
    if (inputContainer) {
      inputContainer.measureInWindow((x, y, width, height) => {
        setDropdownPos({
          top: y + height + 2,
          left: x,
          width,
        });
      });
    }
  }, []);

  // The text of the field currently being typed in
  const activeTerm = activeField ? searchForm[activeField] : "";

  // Debounced suggestion fetch
  useEffect(() => {
    const term = activeTerm.trim();

    // Nothing to fetch: no field, free-text phrase, or too few characters
    if (!activeField || activeField === "phrase" || term.length < MIN_CHARS) {
      abortRef.current?.abort();
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    // Instant result for terms we've already fetched
    const key = `${activeField}:${term}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      abortRef.current?.abort();
      setSuggestions(cached);
      setIsLoadingSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel any still-in-flight previous request before starting a new one
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoadingSuggestions(true);

      try {
        const response = await axios.get(FIELD_ENDPOINTS[activeField], {
          params: { term },
          signal: controller.signal,
          timeout: 8000,
        });

        const list: string[] = Array.isArray(response.data)
          ? response.data.slice(0, MAX_SUGGESTIONS)
          : [];

        cacheRef.current.set(key, list);
        setSuggestions(list);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.warn(`Error fetching suggestions for [${activeField}]:`, error);
        setSuggestions([]);
      } finally {
        // Only the latest request is allowed to clear the loading flag
        if (abortRef.current === controller) {
          setIsLoadingSuggestions(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [activeField, activeTerm]);

  // Abort anything in flight if the component unmounts
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      abortRef.current?.abort();
      setActiveField(null);
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      setDropdownPos(null);
      onClose();
    });
  };

  const onInputChange = (field: SearchFormField, value: string) => {
    setActiveField(field);
    setSearchForm((prev) => ({ ...prev, [field]: value }));
  };

  // Picker values come from a fixed list, so they should not trigger autocomplete
  const onPickerChange = (field: SearchFormField, value: string) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }));
    setActiveField(null);
    setDropdownPos(null);
  };

  const handleSelectSuggestion = (
    field: SearchFormField,
    selectedValue: string,
  ) => {
    setSearchForm((prev) => ({ ...prev, [field]: selectedValue }));
    setSuggestions([]);
    setActiveField(null);
    setDropdownPos(null);
  };

  const handleResetSearch = () => {
    abortRef.current?.abort();
    setSearchForm(initialSearchForm);
    setActiveField(null);
    setSuggestions([]);
    setIsLoadingSuggestions(false);
    setDropdownPos(null);
  };

  const handlePerformSearch = () => {
    router.push({ pathname: "/search" as any, params: { ...searchForm } });
    handleClose();
  };

  const handleFocusField = useCallback(
    (field: SearchFormField) => {
      setActiveField(field);
      updateDropdownPosition(field);
    },
    [updateDropdownPosition],
  );

  const handleScroll = useCallback(() => {
    if (activeField) {
      updateDropdownPosition(activeField);
    }
  }, [activeField, updateDropdownPosition]);

  const renderInputField = (
    field: SearchFormField,
    label: string,
    placeholder: string,
    keyboardType: "default" | "numeric" = "default",
    type: "text" | "selection" = "text",
    choice?: string[],
  ) => {
    return (
      <View style={styles.inputGroup} key={field}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View
          ref={(ref) => {
            if (ref) inputRefs.current[field] = ref;
          }}
          collapsable={false}
        >
          {type === "selection" && choice && (
            <Picker
              selectedValue={searchForm[field]}
              onValueChange={(val) => onPickerChange(field, val)}
              style={{ backgroundColor: Brand.colors.surface }}
            >
              {choice.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          )}

          {type === "text" && (
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#999"
              keyboardType={keyboardType}
              value={searchForm[field]}
              onFocus={() => handleFocusField(field)}
              onChangeText={(val) => onInputChange(field, val)}
              autoCorrect={false}
            />
          )}
        </View>
      </View>
    );
  };

  // Keep the list on screen while a newer request loads; show the spinner
  // only when there is nothing to show yet.
  const showDropdownOverlay =
    !!activeField &&
    !!dropdownPos &&
    (suggestions.length > 0 || isLoadingSuggestions);

  return (
    <Modal
      visible={isSearchOpen}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.fullscreenContainer}>
        {/* Animated Dark Backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            setActiveField(null);
            setDropdownPos(null);
            handleClose();
          }}
        >
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </Pressable>

        {/* Sliding Animated Drawer Panel */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialCommunityIcons
                name="file-search-outline"
                size={24}
                color={Brand.colors.primary}
              />
              <Text style={styles.drawerTitle}>Search Cases</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={12}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Brand.colors.ink}
              />
            </Pressable>
          </View>

          {/* Form Fields ScrollView */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="always"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {renderInputField("title", "Title", "e.g. Case Title")}
            {renderInputField("phrase", "Phrase", "e.g. Key Phrase", "default")}
            {renderInputField("subject", "Subject", "e.g. Subject / Matter")}

            {renderInputField(
              "casetype",
              "Case Type",
              "e.g. Civil / Criminal",
              "default",
              "selection",
              ["Civil", "Criminal", "All"],
            )}

            {renderInputField("year", "Year", "e.g. 2024", "default")}

            {renderInputField("appellant", "Appellant", "Appellant Name")}
            {renderInputField("respondent", "Respondent", "Respondent Name")}

            {renderInputField("relevvant_law", "Relevant Law", "Law / Act")}

            {renderInputField(
              "relevvant_section",
              "Relevant Section",
              "Section No.",
            )}

            {renderInputField("court", "Court", "Court Name")}
            {renderInputField("citation", "Citation", "Citation Reference")}
            {renderInputField("judge", "Judge", "Judge Name")}
            {renderInputField("advocate", "Advocate", "Advocate Name")}

            {renderInputField(
              "delivery_date_from",
              "Delivery From",
              "YYYY-MM-DD",
            )}

            {renderInputField("delivery_date_to", "Delivery To", "YYYY-MM-DD")}
          </ScrollView>

          {/* Floating Dropdown Overlay (outside the ScrollView to isolate scroll gestures) */}
          {showDropdownOverlay && dropdownPos && (
            <View
              style={[
                styles.floatingDropdown,
                {
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  width: dropdownPos.width,
                },
              ]}
            >
              {suggestions.length === 0 ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator
                    size="small"
                    color={Brand.colors.primary}
                  />
                  <Text style={styles.loaderText}>Fetching suggestions...</Text>
                </View>
              ) : (
                <ScrollView
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 150 }}
                  showsVerticalScrollIndicator={true}
                >
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={`${item}-${index}`}
                      style={styles.dropdownItem}
                      onPress={() =>
                        activeField && handleSelectSuggestion(activeField, item)
                      }
                    >
                      <MaterialCommunityIcons
                        name="magnify"
                        size={16}
                        color={Brand.colors.inkSoft}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Footer Actions */}
          <View style={styles.drawerFooter}>
            <Pressable style={styles.resetButton} onPress={handleResetSearch}>
              <Text style={styles.resetText}>Clear</Text>
            </Pressable>
            <Pressable
              style={styles.submitButton}
              onPress={handlePerformSearch}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.submitText}>Search</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Brand.colors.background,
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 4, height: 0 },
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
  },
  formContainer: {
    padding: 16,
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.colors.ink,
    textTransform: "capitalize",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Brand.colors.ink,
    backgroundColor: Brand.colors.surface,
  },
  floatingDropdown: {
    position: "absolute",
    backgroundColor: Brand.colors.background,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.medium,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 9999,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  dropdownItemText: {
    fontSize: 13,
    color: Brand.colors.ink,
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
  loaderText: {
    fontSize: 12,
    color: Brand.colors.inkSoft,
  },
  drawerFooter: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
    backgroundColor: Brand.colors.background,
  },
  resetButton: {
    flex: 1,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Brand.radius.medium,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.colors.ink,
  },
  submitButton: {
    flex: 2,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.primary,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
