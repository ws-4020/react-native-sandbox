import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-elements';

import {ErrorInEventHandler} from './ErrorInEventHandler';
import {ErrorInNativeModule} from './ErrorInNativeModules';
import {ErrorInReactComponent} from './ErrorInReactComponent';
import {ErrorInUseEffectAsyncProcess} from './ErrorInUseEffectAsyncProcess';
import {ErrorInUseEffectSyncProcess} from './ErrorInUseEffectSyncProcess';
import {ErrorInWebView} from './ErrorInWebView';

const ScreenName = 'ErrorCase';
const Screen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Button onPress={() => navigation.navigate(ErrorInEventHandler.ScreenName)} title="イベントハンドラでエラー" />
      <Button
        onPress={() => navigation.navigate(ErrorInUseEffectSyncProcess.ScreenName)}
        title="useEffect内の同期処理でエラー"
      />
      <Button
        onPress={() => navigation.navigate(ErrorInUseEffectAsyncProcess.ScreenName)}
        title="useEffect内の非同期処理でエラー"
      />
      <Button onPress={() => navigation.navigate(ErrorInReactComponent.ScreenName)} title="ReactComponentでエラー" />
      <Button onPress={() => navigation.navigate(ErrorInNativeModule.ScreenName)} title="Native Modulesでエラー" />
      <Button onPress={() => navigation.navigate(ErrorInWebView.ScreenName)} title="WebViewでエラー" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});

export const ErrorCase = {
  Screen,
  ScreenName,
};
