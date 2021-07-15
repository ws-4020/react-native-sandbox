import {NavigationContainer} from '@react-navigation/native';
import {RootStackNav} from 'navigation';
import React from 'react';
import {Platform, NativeModules} from 'react-native';

// import {ErrorBoundary} from './components/ErrorBoundary';
const {ExceptionHandlerModule} = NativeModules;

// JavaScriptで発生したエラーは、Native Modulesで捕捉するので、ErrorUtilsで捕捉しない
// if (Platform.OS !== 'web') {
//   const globalHandler = ErrorUtils.getGlobalHandler();
//   // ErrorUtils came from react-native
//   // https://github.com/facebook/react-native/blob/1151c096dab17e5d9a6ac05b61aacecd4305f3db/Libraries/vendor/core/ErrorUtils.js#L25
//   ErrorUtils.setGlobalHandler((error, isFatal) => {
//     console.log('Did catch error In ErrorUtils.');
//
//     // デフォルトのグローバルハンドラは恐らく↓
//     // https://github.com/facebook/react-native/blob/dc80b2dcb52fadec6a573a9dd1824393f8c29fdc/Libraries/Core/setUpErrorHandling.js#L32
//     globalHandler(error, isFatal);
//   });
// }
ExceptionHandlerModule.setUncaughtExceptionHandler();

export const App = () => {
  return (
    // JavaScriptで発生したエラーは、Native Modulesで捕捉するので、ErrorBoundaryで捕捉しない
    // <ErrorBoundary>
    <NavigationContainer>
      <RootStackNav />
    </NavigationContainer>
    // </ErrorBoundary>
  );
};
