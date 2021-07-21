//
//  RCTExceptionHandlerModule.m
//  ErrorHandling
//

// RCTExceptionHandlerModule.m
#import "RCTExceptionHandlerModule.h"
#import <React/RCTLog.h>
#import "RNFBCrashlyticsNativeHelper.h"

// CONSTANTS
NSString * const RNUncaughtExceptionHandlerSignalExceptionName = @"RNUncaughtExceptionHandlerSignalExceptionName";
NSString * const RNUncaughtExceptionHandlerSignalKey = @"RNUncaughtExceptionHandlerSignalKey";
NSString * const RNUncaughtExceptionHandlerAddressesKey = @"RNUncaughtExceptionHandlerAddressesKey";
atomic_int RNUncaughtExceptionCount = 0;
const int32_t RNUncaughtExceptionMaximum = 10;
const NSInteger RNUncaughtExceptionHandlerSkipAddressCount = 4;
const NSInteger RNUncaughtExceptionHandlerReportAddressCount = 5;

//variable which is used to track till when to keep the app running on exception.
bool dismissApp = true;

//variable to hold the custom error handler passed while customizing native handler
void (^nativeErrorCallbackBlock)(NSException *exception, NSString *readeableException);

// variable to hold the previously defined error handler
NSUncaughtExceptionHandler* previousNativeErrorCallbackBlock;

//variable that holds the default native error handler
void (^defaultNativeErrorCallbackBlock)(NSException *exception, NSString *readeableException) =
^(NSException *exception, NSString *readeableException){
    
    UIAlertController* alert = [UIAlertController
                                alertControllerWithTitle:@"予期しないエラー"
                                message:[NSString stringWithFormat:@"%@\n\n%@",
                                         @"アプリケーションを再起動してください",
                                         @"ErrorCode: 0000"]
                                preferredStyle:UIAlertControllerStyleAlert];
    
    UIApplication* app = [UIApplication sharedApplication];
    UIViewController * rootViewController = app.delegate.window.rootViewController;
    [rootViewController presentViewController:alert animated:YES completion:nil];
};

@implementation RCTExceptionHandlerModule

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE(ExceptionHandlerModule);

RCT_EXPORT_METHOD(setUncaughtExceptionHandler)
{
  previousNativeErrorCallbackBlock = NSGetUncaughtExceptionHandler();
  
  // NSExceptionのみ捕捉できる
  NSSetUncaughtExceptionHandler(&HandleException);
  // NSException以外のエラーは、シグナルハンドラでハンドリング
  signal(SIGABRT, SignalHandler);
  signal(SIGILL, SignalHandler);
  signal(SIGSEGV, SignalHandler);
  signal(SIGFPE, SignalHandler);
  signal(SIGBUS, SignalHandler);
  //Removing SIGPIPE as per https://github.com/master-atul/react-native-exception-handler/issues/32
  //signal(SIGPIPE, SignalHandler);
  NSLog(@"Registerd exception handler.");
}

+ (void) releaseExceptionHold {
    dismissApp = true;
    NSLog(@"Releasing locked exception handler.");
}

- (void)handleException:(NSException *)exception
{
    NSMutableDictionary * info = [NSMutableDictionary dictionary];
    [info setValue:exception forKey:@"Exception"];

    NSError *error = [[NSError alloc] initWithDomain:@"ws4020" code:0 userInfo:info];
    [RNFBCrashlyticsNativeHelper recordNativeError:error];
  
    NSString * readeableError = [NSString stringWithFormat:NSLocalizedString(@"%@\n%@", nil),
                                 [exception reason],
                                 [[exception userInfo] objectForKey:RNUncaughtExceptionHandlerAddressesKey]];
    dismissApp = false;

    defaultNativeErrorCallbackBlock(exception,readeableError);
    
    CFRunLoopRef runLoop = CFRunLoopGetCurrent();
    CFArrayRef allModes = CFRunLoopCopyAllModes(runLoop);
    while (!dismissApp)
    {
        long count = CFArrayGetCount(allModes);
        long i = 0;
        while(i < count){
          
            NSString *mode = CFArrayGetValueAtIndex(allModes, i);
            if(![mode isEqualToString:@"kCFRunLoopCommonModes"]){
                CFRunLoopRunInMode((CFStringRef)mode, 0.001, false);
            }
            i++;
        }
    }
    
    CFRelease(allModes);
    
    NSSetUncaughtExceptionHandler(NULL);
    signal(SIGABRT, SIG_DFL);
    signal(SIGILL, SIG_DFL);
    signal(SIGSEGV, SIG_DFL);
    signal(SIGFPE, SIG_DFL);
    signal(SIGBUS, SIG_DFL);
    signal(SIGPIPE, SIG_DFL);
    
    kill(getpid(), [[[exception userInfo] objectForKey:RNUncaughtExceptionHandlerSignalKey] intValue]);
    
}

void HandleException(NSException *exception)
{
    int32_t exceptionCount = atomic_fetch_add(&RNUncaughtExceptionCount, 1);
    if (exceptionCount > RNUncaughtExceptionMaximum)
    {
        return;
    }
    
    NSArray *callStack = [RCTExceptionHandlerModule backtrace];
    NSMutableDictionary *userInfo =
    [NSMutableDictionary dictionaryWithDictionary:[exception userInfo]];
    [userInfo
     setObject:callStack
     forKey:RNUncaughtExceptionHandlerAddressesKey];
    
    [[[RCTExceptionHandlerModule alloc] init]
     performSelectorOnMainThread:@selector(handleException:)
     withObject:
     [NSException
      exceptionWithName:[exception name]
      reason:[exception reason]
      userInfo:userInfo]
     waitUntilDone:YES];
}

void SignalHandler(int signal)
{
    int32_t exceptionCount = atomic_fetch_add(&RNUncaughtExceptionCount, 1);
    if (exceptionCount > RNUncaughtExceptionMaximum)
    {
        return;
    }
    
    NSMutableDictionary *userInfo =
    [NSMutableDictionary
     dictionaryWithObject:[NSNumber numberWithInt:signal]
     forKey:RNUncaughtExceptionHandlerSignalKey];
    
    NSArray *callStack = [RCTExceptionHandlerModule backtrace];
    [userInfo
     setObject:callStack
     forKey:RNUncaughtExceptionHandlerAddressesKey];
    
    [[[RCTExceptionHandlerModule alloc] init]
     performSelectorOnMainThread:@selector(handleException:)
     withObject:
     [NSException
      exceptionWithName:RNUncaughtExceptionHandlerSignalExceptionName
      reason:
      [NSString stringWithFormat:
       NSLocalizedString(@"Signal %d was raised.", nil),
       signal]
      userInfo:
      [NSDictionary
       dictionaryWithObject:[NSNumber numberWithInt:signal]
       forKey:RNUncaughtExceptionHandlerSignalKey]]
     waitUntilDone:YES];
}

+ (NSArray *)backtrace
{
    void* callstack[128];
    int frames = backtrace(callstack, 128);
    char **strs = backtrace_symbols(callstack, frames);
    
    int i;
    NSMutableArray *backtrace = [NSMutableArray arrayWithCapacity:frames];
    for (
         i = RNUncaughtExceptionHandlerSkipAddressCount;
         i < RNUncaughtExceptionHandlerSkipAddressCount +
         RNUncaughtExceptionHandlerReportAddressCount;
         i++)
    {
        [backtrace addObject:[NSString stringWithUTF8String:strs[i]]];
    }
    free(strs);
    
    return backtrace;
}

@end

