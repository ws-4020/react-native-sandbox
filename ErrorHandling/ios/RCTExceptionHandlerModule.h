//
//  RCTExceptionHandlerModule.h
//  ErrorHandling
//

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else
#import "RCTBridgeModule.h"
#endif

#import  <UIKit/UIKit.h>
#include <stdatomic.h>
#include <execinfo.h>
@interface RCTExceptionHandlerModule : NSObject <RCTBridgeModule>
@end

