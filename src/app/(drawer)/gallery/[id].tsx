import { API_BASE_URL } from "@/config/apiUrls";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { decode } from "html-entities";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function GalleryCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Overlay state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const flatListRef = useRef<FlatList>(null);

  // Update header title dynamically
  useEffect(() => {
    if (id) {
      navigation.setOptions({ title: id.replace("_", " ") });
    }
  }, [id, navigation]);

  // Fetch Category Images
  const fetchCategoryImages = useCallback(async () => {
    try {
      setError(null);
      const baseUrl = `${API_BASE_URL}gallery/${id}?_fields=title,gallery_images`;
      const response = await axios.get<any>(baseUrl, {
        params: { id },
      });
      setImages(response.data.gallery_images);
    } catch (err) {
      setError("Failed to load category images.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategoryImages();
  }, [fetchCategoryImages]);

  const openOverlay = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const closeOverlay = () => {
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A27440" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Category Image List */}
      <FlatList
        data={images}
        keyExtractor={(item) => item.file.toString()}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.imageCard}
            onPress={() => openOverlay(index)}
          >
            <Image
              source={{
                uri:
                  "https://www.lawyersnjurists.com/wp-content/uploads/" +
                  item.file,
              }}
              style={styles.gridImage}
              resizeMode="cover"
            />

            <View style={styles.captionContainer}>
              {/* <Text style={styles.captionTitle}></Text> */}
              {item.description ? (
                <Text style={styles.captionDesc} numberOfLines={2}>
                  {decode(item.description)}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />

      {/* 2. Full-Page Swipeable Image Modal Overlay */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeOverlay}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={closeOverlay}>
            <MaterialCommunityIcons name="close" size={30} color="#ffffff" />
          </Pressable>

          {/* Counter */}
          <Text style={styles.counterText}>
            {selectedIndex + 1} / {images.length}
          </Text>

          {/* Horizontal Swipeable Image List */}
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            keyExtractor={(item) => item.file.toString()}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / width,
              );
              setSelectedIndex(newIndex);
            }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.fullScreenItem}>
                <Image
                  source={{
                    uri:
                      "https://www.lawyersnjurists.com/wp-content/uploads/" +
                      item.file,
                  }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                <View style={styles.modalInfo}>
                  {/* <Text style={styles.modalTitle}>{item.title}</Text> */}
                  {item.description ? (
                    <Text style={styles.modalDesc}>{item.description}</Text>
                  ) : null}
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 15, color: "#c62828" },
  imageCard: {
    width: width,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  gridImage: { width: "100%", height: 260 },
  captionContainer: { padding: 14 },
  captionTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  captionDesc: { fontSize: 13, color: "#666", marginTop: 4 },

  // Modal Overlay Styles
  modalContainer: { flex: 1, backgroundColor: "#000000" },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  counterText: {
    position: "absolute",
    top: 48,
    left: 20,
    zIndex: 10,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fullScreenItem: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: width, height: height * 0.65 },
  modalInfo: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  modalDesc: { color: "#dddddd", fontSize: 14, marginTop: 6 },
});
