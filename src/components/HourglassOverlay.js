import { View, StyleSheet, Dimensions } from 'react-native';
import Hourglass from '../../assets/images/hourglass.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRIANGLE_WIDTH = SCREEN_WIDTH * 0.4;
const TRIANGLE_HEIGHT = TRIANGLE_WIDTH * (152 / 166);

export default function HourglassOverlay() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Hourglass
        width={TRIANGLE_WIDTH}
        height={TRIANGLE_HEIGHT}
        style={{ transform: [{ rotate: '180deg' }] }}
      />
      <Hourglass width={TRIANGLE_WIDTH} height={TRIANGLE_HEIGHT} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -TRIANGLE_HEIGHT,
    alignItems: 'center',
    gap: 8,
  },
});
