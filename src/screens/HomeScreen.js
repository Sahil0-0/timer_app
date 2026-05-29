import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import ChronosBg from '../../assets/images/chronos_bg.svg';
import DialArcs from '../components/DialArcs';
import HourglassOverlay from '../components/HourglassOverlay';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

export default function HomeScreen() {
  const textOpacity = useRef(new Animated.Value(1)).current;
  const dialOpacity = useRef(new Animated.Value(0)).current;
  const [time, setTime] = useState({ hours: 0, minutes: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);

  const handleStartStop = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      return;
    }
    const totalSeconds = time.hours * 3600 + time.minutes * 60;
    if (totalSeconds === 0) return;
    setRemaining(totalSeconds);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

  useEffect(() => () => clearInterval(intervalRef.current), []);

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
        <DialArcs
          onTimeChange={setTime}
          value={isRunning ? { hours: Math.floor(remaining / 3600), minutes: Math.floor((remaining % 3600) / 60) } : undefined}
          disabled={isRunning}
        />
        <HourglassOverlay />
        <View style={styles.buttonContainer}>
          <Text style={styles.timeText}>
            {isRunning
              ? `${String(Math.floor(remaining / 3600)).padStart(2, '0')}h ${String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')}m ${String(remaining % 60).padStart(2, '0')}s`
              : `${String(time.hours).padStart(2, '0')}h ${String(time.minutes).padStart(2, '0')}m 00s`}
          </Text>
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleStartStop}>
            <Text style={styles.buttonText}>{isRunning ? 'STOP' : 'START'}</Text>
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
    gap: 16,
  },
  timeText: {
    fontFamily: fontFamily.regular,
    fontSize: 32,
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 36,
    backgroundColor: '#000000',
    borderRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 8,
    borderTopColor: colors.mirror[1],
    borderLeftColor: colors.mirror[0],
    borderRightColor: colors.mirror[0],
    borderBottomColor: '#1a1a1a',
  },
  buttonText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 6,
    textAlign: 'center',
  },
});
