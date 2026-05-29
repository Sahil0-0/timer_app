import WidgetKit
import SwiftUI

extension View {
    @ViewBuilder
    func scrollDownTransition(value: Int) -> some View {
        if #available(iOSApplicationExtension 16.0, *) {
            self
                .contentTransition(.numericText(countsDown: true))
                .animation(.easeInOut(duration: 0.3), value: value)
        } else {
            self
        }
    }
}

struct ChronosEntry: TimelineEntry {
    let date: Date
    let isRunning: Bool
    let endTime: Date

    var remaining: Int { max(0, Int(endTime.timeIntervalSince(date))) }
    var hours: Int { remaining / 3600 }
    var minutes: Int { (remaining % 3600) / 60 }
    var seconds: Int { remaining % 60 }
}

struct ChronosProvider: TimelineProvider {
    func placeholder(in context: Context) -> ChronosEntry {
        ChronosEntry(date: Date(), isRunning: false, endTime: Date())
    }
    func getSnapshot(in context: Context, completion: @escaping (ChronosEntry) -> Void) {
        completion(readEntry(at: Date()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<ChronosEntry>) -> Void) {
        let base = readEntry(at: Date())

        if base.isRunning {
            var entries: [ChronosEntry] = []
            let now = Date()
            var tick = Date(timeIntervalSince1970: floor(now.timeIntervalSince1970))
            var count = 0
            while tick < base.endTime && count < 100 {
                entries.append(ChronosEntry(date: tick, isRunning: true, endTime: base.endTime))
                tick = tick.addingTimeInterval(1)
                count += 1
            }
            if tick >= base.endTime {
                entries.append(ChronosEntry(date: base.endTime, isRunning: false, endTime: base.endTime))
            }
            completion(Timeline(entries: entries, policy: .atEnd))
        } else {
            completion(Timeline(entries: [base], policy: .never))
        }
    }

    private func readEntry(at date: Date) -> ChronosEntry {
        #if targetEnvironment(simulator)
        let dict = NSDictionary(contentsOfFile: "/tmp/chronos_widget_state.plist")
        let endTimeInterval = dict?["widget_endTime"] as? Double ?? 0
        let isRunning = dict?["widget_isRunning"] as? Bool ?? false
        #else
        let defaults = UserDefaults(suiteName: "group.com.chronos.app.sahil")
        let endTimeInterval = defaults?.double(forKey: "widget_endTime") ?? 0
        let isRunning = defaults?.bool(forKey: "widget_isRunning") ?? false
        #endif

        let endTime = Date(timeIntervalSince1970: endTimeInterval)
        let actuallyRunning = isRunning && endTime > date
        return ChronosEntry(date: date, isRunning: actuallyRunning, endTime: endTime)
    }
}

struct ChronosWidgetView: View {
    var entry: ChronosProvider.Entry

    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content
                .containerBackground(for: .widget) {
                    Image("widget_bg")
                        .resizable()
                        .scaledToFill()
                }
                .overlay(alignment: .topTrailing) {
                    secondsView.padding(.trailing, 14).padding(.top, 8)
                    
                }
        } else {
            ZStack {
                Image("widget_bg")
                    .resizable()
                    .scaledToFill()
                content
            }
            .clipShape(ContainerRelativeShape())
            .overlay(alignment: .topTrailing) {
                secondsView.padding(.trailing, 14)
            }
        }
    }

    @ViewBuilder
    var secondsView: some View {
        HStack(alignment: .lastTextBaseline, spacing: 2) {
            Text(String(format: "%02d", entry.seconds))
                .font(.custom("IntelOneMono-Light", size: 12))
                .foregroundColor(.white)
                .scrollDownTransition(value: entry.seconds)
            Text("secs")
                .font(.custom("IntelOneMono-Light", size: 8))
                .foregroundColor(.white)
        }
    }

    @ViewBuilder
    var content: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(String(format: "%02d", entry.hours))
                    .font(.custom("IntelOneMono-Light", size: 44))
                    .foregroundColor(.white)
                    .scrollDownTransition(value: entry.hours)
                Text("hrs")
                    .font(.custom("IntelOneMono-Light", size: 13))
                    .foregroundColor(.white)
            }
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(String(format: "%02d", entry.minutes))
                    .font(.custom("IntelOneMono-Light", size: 44))
                    .foregroundColor(.white)
                    .scrollDownTransition(value: entry.minutes)
                Text("mins")
                    .font(.custom("IntelOneMono-Light", size: 13))
                    .foregroundColor(.white)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

@main
struct ChronosWidget: Widget {
    let kind: String = "ChronosWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ChronosProvider()) { entry in
            ChronosWidgetView(entry: entry)
        }
        .configurationDisplayName("Chronos Timer")
        .description("See your focus session at a glance.")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct ChronosWidget_Previews: PreviewProvider {
    static var previews: some View {
        ChronosWidgetView(entry: ChronosEntry(date: .now, isRunning: false, endTime: .now))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Idle")

        ChronosWidgetView(entry: ChronosEntry(date: .now, isRunning: true, endTime: .now.addingTimeInterval(9 * 3600 + 30 * 60)))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Running")
    }
}
