import { NativeModules, Platform } from 'react-native';

const { TimerWidgetModule } = NativeModules;

// Call this whenever the timer state changes (start, pause, tick, stop)
// hours/minutes: current remaining time
// isRunning: true = show timer, false = show idle state
export function updateWidget(hours, minutes, isRunning) {
  if (TimerWidgetModule) {
    TimerWidgetModule.updateWidget(hours, minutes, isRunning);
  }
}
