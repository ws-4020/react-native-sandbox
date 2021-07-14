import {NavigationContainer} from '@react-navigation/native';
import {RootStackNav} from 'navigation';
import React from 'react';
import {Platform, NativeModules} from 'react-native';

import {ErrorBoundary} from './components/ErrorBoundary';
const {ExceptionHandlerModule} = NativeModules;

if (Platform.OS !== 'web') {
  const globalHandler = ErrorUtils.getGlobalHandler();
  // ErrorUtils came from react-native
  // https://github.com/facebook/react-native/blob/1151c096dab17e5d9a6ac05b61aacecd4305f3db/Libraries/vendor/core/ErrorUtils.js#L25
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // TODO Firebase Crashlyticsにログ送信
    console.log('Did catch error In ErrorUtils.');

    // デフォルトのグローバルハンドラは恐らく↓
    // https://github.com/facebook/react-native/blob/dc80b2dcb52fadec6a573a9dd1824393f8c29fdc/Libraries/Core/setUpErrorHandling.js#L32
    globalHandler(error, isFatal);

    // TODO アプリ再起動のUI表示。再起動はNative側から再起動するかJSCの再起動（バンドルモジュールのリロード）のどちらにするかは要検討
    console.log('Reload app.');
  });
}
ExceptionHandlerModule.handle();

export const App = () => {
  return (
    // <ErrorBoundary>
    <NavigationContainer>
      <RootStackNav />
    </NavigationContainer>
    // </ErrorBoundary>
  );
};
