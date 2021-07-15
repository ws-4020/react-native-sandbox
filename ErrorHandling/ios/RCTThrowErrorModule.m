//
//  RCTThrowErrorModule.m
//  ErrorHandling
//

// RCTThrowErrorModule.m
#import "RCTThrowErrorModule.h"
#import <React/RCTLog.h>

@implementation RCTThrowErrorModule

RCT_EXPORT_MODULE(ThrowErrorModule);

RCT_EXPORT_METHOD(throwErrorSyncProcess)
{
  @throw @"Throw exception in synchronous process.";
}

RCT_EXPORT_METHOD(throwErrorAsyncProcess)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void) {
    @throw @"Throw exception in asynchronous process.";
  });
}

@end
