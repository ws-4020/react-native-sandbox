import React, {useCallback} from 'react';
import {NativeModules, StyleSheet, View} from 'react-native';
import {Button} from 'react-native-elements';

const {ThrowErrorModule} = NativeModules;
const ScreenName = 'ErrorInNativeModules';
const Screen = () => {
  const throwErrorInSyncProcess = useCallback(async () => {
    await ThrowErrorModule.throwErrorSyncProcess();
  }, []);

  const throwErrorInAsyncProcess = useCallback(async () => {
    await ThrowErrorModule.throwErrorAsyncProcess();
  }, []);

  return (
    <View style={styles.container}>
      <Button onPress={throwErrorInSyncProcess} title="Native Modules内の同期処理でエラー発生" />
      <Button onPress={throwErrorInAsyncProcess} title="Native Modules内の非同期処理でエラー発生" />
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

export const ErrorInNativeModule = {
  Screen,
  ScreenName,
};
