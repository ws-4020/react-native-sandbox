import crashlytics from '@react-native-firebase/crashlytics';
import {NavigationContainer} from '@react-navigation/native';
import {RootStackNav} from 'navigation';
import React from 'react';
import {NativeModules} from 'react-native';
import {QueryClient, QueryClientProvider, setLogger} from 'react-query';

// import {ErrorBoundary} from './components/ErrorBoundary';
const {ExceptionHandlerModule} = NativeModules;

// JavaScriptの非同期処理以外で発生したエラーを捕捉する
// if (Platform.OS !== 'web') {
//   const globalHandler = ErrorUtils.getGlobalHandler();
//   // ErrorUtils came from react-native
//   // https://github.com/facebook/react-native/blob/1151c096dab17e5d9a6ac05b61aacecd4305f3db/Libraries/vendor/core/ErrorUtils.js#L25
//   ErrorUtils.setGlobalHandler(async (error, isFatal) => {
//     console.log('Did catch error In ErrorUtils.');
//
//     // デフォルトのグローバルハンドラは恐らく↓
//     // https://github.com/facebook/react-native/blob/dc80b2dcb52fadec6a573a9dd1824393f8c29fdc/Libraries/Core/setUpErrorHandling.js#L32
//     globalHandler(error, isFatal);
//   });
// }

// Native Modulesで発生したエラーを自分たちでグローバルにハンドリングしたい場合は、エラーハンドラを登録する
// ExceptionHandlerModule.setUncaughtExceptionHandler();

// Firebase Crashlyticsの初期化
crashlytics().setUserId('testUser');
// React Queryの初期化
const queryClient = new QueryClient();

// ステータスコードが400以上の場合や、ネットワークエラーの場合は全てerrorになる。
// ステータスコードによってFirebase Crashlyticsに送るか分岐するならば、共通エラー処理側でやればいいのでsetLoggerは使用しない
// if (!__DEV__) {
//   setLogger({
//     log: (message) => {
//       console.log(message);
//     },
//     warn: (message) => {
//       console.warn(message);
//     },
//     error: (error) => {
//       crashlytics().recordError(error, 'HttpApiError');
//     },
//   });
// }

// TODO 初期処理でユーザIDを設定

export const App = () => {
  return (
    // ErrorBoundaryでReact Componentsで発生したエラーを捕捉
    // <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootStackNav />
      </NavigationContainer>
    </QueryClientProvider>
    // </ErrorBoundary>
  );
};
