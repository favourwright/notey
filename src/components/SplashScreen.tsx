import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { useFonts, CoveredByYourGrace_400Regular } from '@expo-google-fonts/covered-by-your-grace';
import { checkOnboardingSeen } from "@/store/onboarding";

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <AnimatedSplashScreen>
      {children}
    </AnimatedSplashScreen>
  );
}

function AnimatedSplashScreen({ children }) {
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isLottieAnimComplete, setLottieAnimComplete] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAppReady && isLottieAnimComplete) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAppReady, isLottieAnimComplete]);

  let [fontsLoaded] = useFonts({
    CoveredByYourGrace_400Regular,
  });

  const onSplashScreenAssetsLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      // Load stuff absolutely necessary for app to function
      // await Promise.all([]);
    } catch (e) {
      // handle errors
    } finally {
      if(fontsLoaded) setAppReady(true);
    }
  }, [fontsLoaded]);

  // use this to make sure font is ready before setting appReady
  useEffect(()=>{
    if(fontsLoaded) {
      setAppReady(true);
    }
  },[fontsLoaded])
  
  useEffect(()=>{
    onSplashScreenAssetsLoaded()
  }, [])

  const handleEndSplashAnim = useCallback(async () => {
    // check if onboarding is complete else, start onboarding
    const check = await checkOnboardingSeen()
    if(!check) router.replace('/onboarding')
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLottieAnimComplete(true);
  }, []);
  
  return (
    <View onLayout={handleEndSplashAnim} style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          className='bg-primary justify-center items-center'
          style={[ StyleSheet.absoluteFill, { opacity: animation } ]}>
          <LottieView
            autoPlay
            style={{ width: 100, aspectRatio:1}}
            // Find more Lottie files at https://lottiefiles.com/featured
            source={require('@/assets/lottie/loading-anim.json')}
          />
        </Animated.View>
      )}
    </View>
  );
}