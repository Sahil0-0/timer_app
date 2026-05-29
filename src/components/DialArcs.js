import { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Dimensions, PanResponder, Animated } from "react-native";
import Svg, { Line, Text as SvgText, G } from "react-native-svg";
import DialSvg from "../../assets/images/dial.svg";
import { fontFamily } from "../theme/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DIAL_SIZE = SCREEN_WIDTH * 1.5;
const DEG_PER_PX = 0.4;

const HOURS_STEP_DEG = 30;
const MINS_STEP_DEG = 6; 
const HOUR_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MIN_VALUES = Array.from({ length: 60 }, (_, i) => i); 

const computeSelectedMinute = (angle) =>
  ((Math.round(-angle / MINS_STEP_DEG) % 60) + 60) % 60;

function DialFace({
  size,
  values,
  stepDeg,
  majorEvery = 1,
  selectedIndex = null,
  flipLabels = false,
  labelRadiusFactor = 0.42,
  fontSizeFactor = 0.07,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const labelR = size * labelRadiusFactor;
  const tickOuter = size * 0.485;
  const tickInner = size * 0.46;

  const renderTick = (key, deg, active = false) => {
    const rad = (deg - 90) * (Math.PI / 180);
    const x1 = cx + tickOuter * Math.cos(rad);
    const y1 = cy + tickOuter * Math.sin(rad);
    const x2 = cx + tickInner * Math.cos(rad);
    const y2 = cy + tickInner * Math.sin(rad);
    return (
      <Line
        key={key}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="white"
        strokeOpacity={active ? 1 : 0.2}
        strokeWidth={size * 0.004}
      />
    );
  };

  const renderLabel = (key, deg, text, active = false) => {
    const rad = (deg - 90) * (Math.PI / 180);
    const x = cx + labelR * Math.cos(rad);
    const y = cy + labelR * Math.sin(rad);
    return (
      <G key={key} transform={`translate(${x}, ${y}) rotate(${flipLabels ? deg + 180 : deg})`}>
        <SvgText
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fillOpacity={active ? 1 : 0.2}
          fontSize={size * fontSizeFactor}
          fontFamily={fontFamily.bold}
        >
          {text}
        </SvgText>
      </G>
    );
  };

  return (
    <View style={{ width: size, height: size }}>
      <DialSvg width={size} height={size} style={StyleSheet.absoluteFill} />
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        {values.map((val, i) => {
          const isSelected = selectedIndex !== null && i === selectedIndex;
          const isMajor = i % majorEvery === 0;

          if (!isMajor) return renderTick(i, i * stepDeg, isSelected);

          return renderLabel(i, i * stepDeg, String(val).padStart(2, "0"), isSelected);
        })}
      </Svg>
    </View>
  );
}

const computeSelectedHour = (angle) =>
  ((-Math.round(angle / HOURS_STEP_DEG) % 12) + 12) % 12;

export default function DialArcs({ onTimeChange, value, disabled }) {
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedHour, setSelectedHour] = useState(0);
  const lastMinuteRef = useRef(0);
  const lastHourRef = useRef(0);
  const disabledRef = useRef(false);

  useEffect(() => {
    disabledRef.current = !!disabled;
  }, [disabled]);

  useEffect(() => {
    if (value == null) return;
    const targetHourAngle = -value.hours * HOURS_STEP_DEG;
    const targetMinAngle = -value.minutes * MINS_STEP_DEG;
    hoursAngle.current = targetHourAngle;
    minsAngle.current = targetMinAngle;
    setSelectedHour(value.hours);
    setSelectedMinute(value.minutes);
    Animated.parallel([
      Animated.timing(hoursRot, { toValue: targetHourAngle, duration: 600, useNativeDriver: true }),
      Animated.timing(minsRot, { toValue: targetMinAngle, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [value]);

  useEffect(() => {
    onTimeChange?.({ hours: selectedHour, minutes: selectedMinute });
  }, [selectedHour, selectedMinute]);

  const hoursRot = useRef(new Animated.Value(0)).current;
  const minsRot = useRef(new Animated.Value(0)).current;
  const hoursAngle = useRef(0);
  const minsAngle = useRef(0);
  const hoursStartX = useRef(0);
  const minsStartX = useRef(0);
  const hoursStartAngle = useRef(0);
  const minsStartAngle = useRef(0);

  const hoursPR = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: (evt) => {
        hoursStartX.current = evt.nativeEvent.pageX;
        hoursStartAngle.current = hoursAngle.current;
        hoursRot.stopAnimation();
      },
      onPanResponderMove: (evt) => {
        // negated because the 180° flip inverts apparent rotation direction
        const angle =
          hoursStartAngle.current -
          (evt.nativeEvent.pageX - hoursStartX.current) * DEG_PER_PX;
        hoursAngle.current = angle;
        hoursRot.setValue(angle);
        const hour = computeSelectedHour(angle);
        if (hour !== lastHourRef.current) {
          lastHourRef.current = hour;
          setSelectedHour(hour);
        }
      },
      onPanResponderRelease: () => {
        const snapped =
          Math.round(hoursAngle.current / HOURS_STEP_DEG) * HOURS_STEP_DEG;
        hoursAngle.current = snapped;
        Animated.spring(hoursRot, {
          toValue: snapped,
          useNativeDriver: true,
        }).start();
        const hour = computeSelectedHour(snapped);
        lastHourRef.current = hour;
        setSelectedHour(hour);
      },
    }),
  ).current;

  const minsPR = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: (evt) => {
        minsStartX.current = evt.nativeEvent.pageX;
        minsStartAngle.current = minsAngle.current;
        minsRot.stopAnimation();
      },
      onPanResponderMove: (evt) => {
        const angle =
          minsStartAngle.current +
          (evt.nativeEvent.pageX - minsStartX.current) * DEG_PER_PX;
        minsAngle.current = angle;
        minsRot.setValue(angle);
        const minute = computeSelectedMinute(angle);
        if (minute !== lastMinuteRef.current) {
          lastMinuteRef.current = minute;
          setSelectedMinute(minute);
        }
      },
      onPanResponderRelease: () => {
        const snapped =
          Math.round(minsAngle.current / MINS_STEP_DEG) * MINS_STEP_DEG;
        minsAngle.current = snapped;
        Animated.spring(minsRot, {
          toValue: snapped,
          useNativeDriver: true,
        }).start();
        const minute = computeSelectedMinute(snapped);
        lastMinuteRef.current = minute;
        setSelectedMinute(minute);
      },
    }),
  ).current;

  const toRotateDeg = (anim) =>
    anim.interpolate({
      inputRange: [-7200, 0, 7200],
      outputRange: ["-7200deg", "0deg", "7200deg"],
    });

  return (
    <>
      <Animated.View
        style={[
          styles.dialTop,
          {
            transform: [
              { rotate: "180deg" },
              { rotate: toRotateDeg(hoursRot) },
            ],
          },
        ]}
        {...hoursPR.panHandlers}
      >
        <DialFace
          size={DIAL_SIZE}
          values={HOUR_VALUES}
          stepDeg={HOURS_STEP_DEG}
          selectedIndex={selectedHour}
          flipLabels
          labelRadiusFactor={0.46}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.dialBottom,
          { transform: [{ rotate: toRotateDeg(minsRot) }] },
        ]}
        {...minsPR.panHandlers}
      >
        <DialFace
          size={DIAL_SIZE}
          values={MIN_VALUES}
          stepDeg={MINS_STEP_DEG}
          majorEvery={5}
          selectedIndex={selectedMinute}
          fontSizeFactor={0.05}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  dialTop: {
    position: "absolute",
    top: -DIAL_SIZE * 0.35,
    alignSelf: "center",
  },
  dialBottom: {
    position: "absolute",
    bottom: -DIAL_SIZE * 0.35,
    alignSelf: "center",
  },
});
