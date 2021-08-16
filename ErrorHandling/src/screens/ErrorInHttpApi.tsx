import React, {useEffect, useState} from 'react';
import {Alert, Platform, StyleSheet, Text, View} from 'react-native';
import {Button, Input} from 'react-native-elements';

import {useBackendMutation, useBackendQuery} from '../backend/useBackendService';

const ScreenName = 'ErrorInHttpApi';

type Result = {
  message: string;
};

type Body = {
  test: string;
};

const baseHost = Platform.select({
  default: 'localhost',
  android: '10.0.2.2',
});

const Screen = () => {
  const [queryStatusCode, setQueryStatusCode] = useState<string>('200');
  const [mutationStatusCode, setMutationStatusCode] = useState<string>('200');
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [host, setHost] = useState<string>(baseHost);
  const [queryStatusCodeInputValue, setQueryStatusCodeInputValue] = useState<string>();
  const [mutationStatusCodeInputValue, setMutationStatusCodeInputValue] = useState<string>();
  const [ipInputValue, setIpInputValue] = useState<string>();
  const {
    isLoading,
    data,
    error: queryError,
    isError,
    isFetching,
    refetch,
  } = useBackendQuery<Result, string[]>(['test', queryStatusCode, host], (queryKey) => {
    const [_key, statusCode, host] = queryKey;
    return `http://${host}:3000/api/${statusCode}`;
  });
  const mutation = useBackendMutation<Result, Body>(`http://${host}:3000/api/${mutationStatusCode}`);
  useEffect(() => {
    if (queryError?.response?.status === 400) {
      Alert.alert('Getリクエストで業務エラーが発生しました。');
    }
    if (queryError?.response?.status === 404) {
      Alert.alert('リソースが見つかりません。');
    }
  }, [queryError]);
  useEffect(() => {
    if (mutation.error?.response?.status === 400) {
      Alert.alert('Postリクエストで業務エラーが発生しました。');
    }
  }, [mutation.error]);
  useEffect(() => {
    if (isRefetching) {
      setIsRefetching(false);
      // eslint-disable-next-line no-void
      void refetch();
    }
  }, [refetch, isRefetching]);
  useEffect(() => {
    if (isMutating) {
      setIsMutating(false);
      mutation.mutate({test: 'body test.'});
    }
  }, [mutation, isMutating]);

  return (
    <View style={styles.container}>
      <View style={styles.queryContainer}>
        <Text>useQueryの結果領域</Text>
        {isLoading && <Text>Loading...</Text>}
        {isFetching && <Text>Fetching...</Text>}
        {isError && <Text>Error...{queryError?.response?.status}</Text>}
        {data && <Text>{data.message}</Text>}
      </View>
      <View style={styles.mutationContainer}>
        <Text>useMutationの結果領域</Text>
        {mutation.isLoading && <Text>Loading...</Text>}
        {mutation.isError && <Text>Error...{mutation.error?.response?.status}</Text>}
        {mutation.data && <Text>{mutation.data.message}</Text>}
      </View>
      <View style={styles.textInputContainer}>
        <Input
          placeholder="Getリクエストで返却するステータスコードを入力してください"
          style={styles.textInput}
          value={queryStatusCodeInputValue}
          onChangeText={(value) => setQueryStatusCodeInputValue(value)}
        />
      </View>
      <View style={styles.textInputContainer}>
        <Input
          placeholder="Postリクエストで返却するステータスコードを入力してください"
          style={styles.textInput}
          value={mutationStatusCodeInputValue}
          onChangeText={(value) => setMutationStatusCodeInputValue(value)}
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
          style={styles.button}
          title="Getリクエスト"
          onPress={() => {
            setQueryStatusCode(queryStatusCodeInputValue ?? '200');
            setHost(ipInputValue ?? baseHost);
            setIsRefetching(true);
          }}
        />
        <Button
          style={styles.button}
          title="Postリクエスト"
          onPress={() => {
            setMutationStatusCode(mutationStatusCodeInputValue ?? '200');
            setHost(ipInputValue ?? baseHost);
            setIsMutating(true);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  queryContainer: {
    flex: 1,
  },
  mutationContainer: {
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    padding: 10,
  },
});

export const ErrorInHttpApi = {
  Screen,
  ScreenName,
};
