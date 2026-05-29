import Foundation
import WidgetKit

@objc(TimerWidgetModule)
class TimerWidgetModule: NSObject {

    @objc func updateWidget(_ endTime: NSNumber, isRunning: Bool) {
        #if targetEnvironment(simulator)
        let state: NSDictionary = [
            "widget_endTime": endTime.doubleValue,
            "widget_isRunning": isRunning
        ]
        state.write(toFile: "/tmp/chronos_widget_state.plist", atomically: true)
        #else
        let defaults = UserDefaults(suiteName: "group.com.chronos.app.sahil")
        defaults?.set(endTime.doubleValue, forKey: "widget_endTime")
        defaults?.set(isRunning,           forKey: "widget_isRunning")
        defaults?.synchronize()
        #endif

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }

    @objc static func requiresMainQueueSetup() -> Bool { return false }
}
