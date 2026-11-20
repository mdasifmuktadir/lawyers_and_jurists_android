import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";

interface Props {
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: Props) {
  return (
    <View style={styles.animationContainer}>
      <LottieView
        source={require("../../assets/lawyers_jurists_animation.json")}
        autoPlay
        loop={false}
        speed={1}
        resizeMode="contain"
        onAnimationFinish={onAnimationComplete}
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  lottie: {
    width: 250,
    height: 250,
  },
});
