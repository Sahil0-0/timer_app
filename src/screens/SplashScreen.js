import { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import ChronosBg from '../../assets/images/chronos_bg.svg';
import DialArcs from '../components/DialArcs';
import HourglassOverlay from '../components/HourglassOverlay';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

export default function SplashScreen() {
  const textOpacity = useRef(new Animated.Value(1)).current;
  const dialOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dialOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ChronosBg
        width="100%"
        height="100%"
        opacity={0.9}
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: dialOpacity }]}>
        <DialArcs />
        <HourglassOverlay />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
        CHRONOS
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background_black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    lineHeight: 50,
    color: colors.text.primary,
    letterSpacing: 14.4,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#111111',
    borderRadius: 32,
    paddingVertical: 20,
    paddingHorizontal: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#999999',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  buttonText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 6,
    textAlign: 'center',
  },
});
