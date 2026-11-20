import AnimatedSplashScreen from "@/components/AnimatedSplashScreen"; // Adjust the import path if needed
import { Brand, Fonts } from "@/constants/theme";
import * as Font from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar"; //
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
SplashScreen.preventAutoHideAsync().catch(() => {});

const brandTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Brand.colors.primary,
    onPrimary: Brand.colors.background,
    primaryContainer: Brand.colors.surface,
    onPrimaryContainer: Brand.colors.ink,
    secondary: Brand.colors.inkSoft,
    onSecondary: Brand.colors.background,
    background: Brand.colors.background,
    surface: Brand.colors.background,
    surfaceVariant: Brand.colors.surface,
    onSurface: Brand.colors.inkSoft,
    onSurfaceVariant: "#5F5143",
    outline: Brand.colors.border,
    error: Brand.colors.error,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: Fonts?.sans },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: Fonts?.sans },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: Fonts?.sans },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: Fonts?.serif },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: Fonts?.serif,
    },
  },
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({});
      } catch (error) {
        console.warn(error);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide native static splash screen right as app JS finishes initialization
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  // Keep rendering null until fonts and assets are initialized so native splash remains visible
  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" translucent={false} />
      <PaperProvider theme={brandTheme}>
        {!isAnimationFinished ? (
          <View style={styles.splashContainer}>
            <AnimatedSplashScreen
              onAnimationComplete={() => setIsAnimationFinished(true)}
            />
          </View>
        ) : (
          <Slot />
        )}
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: Brand.colors.background,
  },
});
