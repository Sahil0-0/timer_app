#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TimerWidgetModule, NSObject)

RCT_EXTERN_METHOD(updateWidget:(nonnull NSNumber *)endTime
                  isRunning:(BOOL)isRunning)

@end
