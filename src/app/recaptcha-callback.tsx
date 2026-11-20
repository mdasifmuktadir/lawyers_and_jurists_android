import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RecaptchaCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // Instantly return to the previous screen (ContactUs) without showing UI
    router.replace("/contact_us");
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <ActivityIndicator size="large" color="#0056b3" />
    </View>
  );
}
