#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NativeLogger, NSObject)

RCT_EXTERN_METHOD(writeLog:(NSString *)content)
RCT_EXTERN_METHOD(writeAuditExport:(NSString *)jsonPayload)

@end
