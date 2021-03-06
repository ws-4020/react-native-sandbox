import crashlytics from '@react-native-firebase/crashlytics';
import React, {useState} from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import {Button, Input} from 'react-native-elements';
import WebView from 'react-native-webview';
import {WebViewError, WebViewHttpError} from 'react-native-webview/lib/WebViewTypes';

const baseHost = Platform.select({
  default: 'localhost',
  android: '10.0.2.2',
});

const ScreenName = 'ErrorInWebView';
const Screen = () => {
  const [statusCode, setStatusCode] = useState<string>('200');
  const [host, setHost] = useState<string>(baseHost);
  const [statusCodeInputValue, setStatusCodeInputValue] = useState<string>();
  const [ipInputValue, setIpInputValue] = useState<string>();
  const [httpError, setHttpError] = useState<WebViewHttpError>();
  const [error, setError] = useState<WebViewError>();

  return (
    <View style={styles.container}>
      {httpError && (
        <View style={styles.errorContainer}>
          <Text>http error</Text>
          <Text>{httpError.title}</Text>
          <Text>{httpError.statusCode}</Text>
          <Text>{httpError.description}</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text>error</Text>
          <Text>{error.title}</Text>
          <Text>{error.code}</Text>
          <Text>{error.description}</Text>
        </View>
      )}
      <View style={styles.webviewContainer}>
        <WebView
          source={{uri: `http://${host}:3100/webview/${statusCode}`}}
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
      </View>
      <View style={styles.textInputContainer}>
        <Input
          placeholder="???????????????????????????????????????????????????????????????"
          style={styles.textInput}
          value={statusCodeInputValue}
          onChangeText={(value) => setStatusCodeInputValue(value)}
        />
      </View>
      <View style={styles.textInputContainer}>
        <Input
          placeholder="????????????IP????????????????????????localhost or 10.0.2.2???"
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
            setHost(ipInputValue ?? baseHost);
          }}
          title="WebView?????????"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 2,
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
