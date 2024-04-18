import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import LottieView from 'lottie-react-native';

const LottieAnim = () => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      flex: 1,
    }}>
      <LottieView
        autoPlay
        style={{
          width: 200,
          height: 200,
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require('@/assets/lottie/loading-anim.json')}
      />
    </View>
  );
}


export function SplashVideo({ onLoaded, onFinish }) {
  const video = useRef(null);
  const [lastStatus, setStatus] = useState<AVPlaybackStatus>({});
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  return (
    <Video
      ref={video}
      style={StyleSheet.absoluteFill}
      source={
        isTablet
          ? require("@/assets/splash-tablet.mp4")
          : require("@/assets/splash.mp4")
      }
      shouldPlay={!(lastStatus.isLoaded && lastStatus.didJustFinish)}
      isLooping={false}
      resizeMode={ResizeMode.COVER}
      onPlaybackStatusUpdate={(status) => {
        if (status.isLoaded) {
          if (lastStatus.isLoaded !== status.isLoaded) {
            onLoaded();
          }
          if (status.didJustFinish) {
            onFinish();
          }
        }
        setStatus(() => status);
      }}
    />
  );
}

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
  const [isSplashVideoComplete, setSplashVideoComplete] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAppReady && isSplashVideoComplete) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAppReady, isSplashVideoComplete]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      // Load stuff
      await Promise.all([]);
    } catch (e) {
      // handle errors
    } finally {
      setAppReady(true);
    }
  }, []);
  useEffect(()=>{
    onImageLoaded()
  }, [])
  const handleFinishAnimation = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setSplashVideoComplete(true);
  }, []);

  // const videoElement = useMemo(() => {
  //   return (
  //     <SplashVideo
  //       onLoaded={onImageLoaded}
  //       onFinish={() => {
  //         setSplashVideoComplete(true);
  //       }}
  //     />
  //   );
  // }, [onImageLoaded, setSplashVideoComplete]);
  
  return (
    <View onLayout={handleFinishAnimation} style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'light-gray',
              opacity: animation,
            },
          ]}
        >
          {/* {videoElement} */}
          <LottieAnim />
        </Animated.View>
      )}
    </View>
  );
}