import crashlytics from '@react-native-firebase/crashlytics';
import React, {useState} from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import {Button, Input} from 'react-native-elements';
import WebView from 'react-native-webview';
import {WebViewError, WebViewHttpError} from 'react-native-webview/lib/WebViewTypes';

const baseHost = Platform.select({
  ios: 'localhost',
  android: '10.0.2.2',
});

const ScreenName = 'ErrorInWebView';
const Screen = () => {
  const [statusCode, setStatusCode] = useState<string>('200');
  const [host, setHost] = useState<string>(baseHost ?? 'localhost');
  const [statusCodeInputValue, setStatusCodeInputValue] = useState<string>();
  const [ipInputValue, setIpInputValue] = useState<string>();
  const [httpError, setHttpError] = useState<WebViewHttpError | undefined>(undefined);
  const [error, setError] = useState<WebViewError | undefined>(undefined);

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        {httpError ? (
          <View>
            <Text>http error</Text>
            <Text>{httpError.title}</Text>
            <Text>{httpError.statusCode}</Text>
            <Text>{httpError.description}</Text>
          </View>
        ) : error ? (
          <View>
            <Text>error</Text>
            <Text>{error.title}</Text>
            <Text>{error.code}</Text>
            <Text>{error.description}</Text>
          </View>
        ) : (
          <WebView
            source={{uri: `http://${host}:3000/${statusCode}`}}
            onError={(event) => {
              setHttpError(undefined);
              setError(event.nativeEvent);
              crashlytics().recordError(
                new Error(
                  `Error occurred in webview. code=[${event.nativeEvent.code}]. description=[${event.nativeEvent.description}]`,
                ),
                'WebViewError',
              );
            }}
            onHttpError={(event) => {
              setHttpError(event.nativeEvent);
              setError(undefined);
              crashlytics().recordError(
                new Error(
                  `HttpError occurred in webview. statusCode=[${event.nativeEvent.statusCode}]. description=[${event.nativeEvent.description}]`,
                ),
                'WebViewHttpError',
              );
            }}
          />
        )}
      </View>
      <View style={styles.textInputContainer}>
        <Input
          placeholder="返却するステータスコードを入力してください"
          style={styles.textInput}
          value={statusCodeInputValue}
          onChangeText={(value) => setStatusCodeInputValue(value)}
        />
      </View>
      <View style={styles.textInputContainer}>
        <Input
          placeholder="サーバのIP（デフォルトは、localhost or 10.0.2.2）"
          style={styles.textInput}
          value={ipInputValue}
          onChangeText={(value) => setIpInputValue(value)}
        />
      </View>
      <View style={styles.actionContainer}>
        <Button
          onPress={() => {
            setHttpError(undefined);
            setError(undefined);
            setStatusCode(statusCodeInputValue ?? '200');
            setHost(ipInputValue ?? baseHost ?? 'localhost');
          }}
          title="WebView再表示"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webviewContainer: {
    flex: 6,
    width: '100%',
  },
  textInputContainer: {
    flex: 1,
    marginTop: 10,
  },
  textInput: {
    fontSize: 12,
  },
  actionContainer: {
    flex: 1,
    marginTop: 10,
    alignItems: 'center',
  },
});

export const ErrorInWebView = {
  Screen,
  ScreenName,
};
