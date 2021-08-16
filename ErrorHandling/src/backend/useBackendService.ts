import crashlytics from '@react-native-firebase/crashlytics';
import axios, {AxiosError} from 'axios';
import {Alert} from 'react-native';
import {
  EnsuredQueryKey,
  QueryClient,
  QueryKey,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';

import {HttpApiClient} from './HttpApiClient';

// 画面の入力値によってbaseURLを変えるので、baseURLを設定しないaxiosのインスタンスでHTTP APIクライアントを作成
const httpApiClient = new HttpApiClient(axios.create());

export type ErrorResponse = {
  code: string;
  message: string;
};

export const useBackendQuery = <TData = unknown, TQueryKey extends QueryKey = QueryKey>(
  queryKey: TQueryKey,
  pathFn: (queryKey: EnsuredQueryKey<TQueryKey>) => string,
  options?: UseQueryOptions<TData, AxiosError<ErrorResponse>, TData, TQueryKey>,
): UseQueryResult<TData, AxiosError<ErrorResponse>> => {
  const queryClient = useQueryClient();
  return useQuery<TData, AxiosError<ErrorResponse>, TData, TQueryKey>(
    queryKey,
    async (context) => {
      const promise = httpApiClient.get<TData>(pathFn(context.queryKey));
      const timeoutObj = timeout(queryClient, queryKey);
      try {
        return (await promise).data;
      } finally {
        clearTimeout(timeoutObj);
      }
    },
    {
      onError: (err) => _onError(err),
      retry: shouldRetry,
      ...options,
    },
  );
};

export const useBackendMutation = <TData = unknown, TVariables = void, TContext = unknown>(
  path: string,
  options?: UseMutationOptions<TData, AxiosError<ErrorResponse>, TVariables, TContext>,
): UseMutationResult<TData, AxiosError<ErrorResponse>, TVariables, TContext> => {
  return useMutation<TData, AxiosError<ErrorResponse>, TVariables, TContext>(
    async (variables) => {
      const response = await httpApiClient.post<TData>(path, variables);
      return response.data;
    },
    {
      onError: (err) => _onError(err),
      retry: shouldRetry,
      ...options,
    },
  );
};

const _onError = (error: AxiosError<ErrorResponse>) => {
  if (error.response?.status) {
    const status = error.response.status;
    if (status === 400) {
      // 何もしない
    } else if (status === 401) {
      // TODO 未認証とみなして、ログイン画面などに遷移
    } else if (status === 404) {
      // 何もしない
    } else if (status === 412) {
      Alert.alert('アプリを新しいバージョンにアップデートしてください。');
    } else if (status === 429) {
      Alert.alert('只今混み合っています。しばらくしてから再度お試しください。');
    } else if (status === 503) {
      Alert.alert('システムメンテナンス中です。');
    } else {
      crashlytics().recordError(error, 'HttpApiSystemError');
      Alert.alert('予期しない例外が発生しました。');
    }
  } else {
    Alert.alert('端末のネットワークを確認するか、しばらくしてから再度お試しください。');
  }
};

const shouldRetry = (failureCount: number, error: AxiosError<ErrorResponse>) => {
  if (error.response?.status) {
    const status = error.response.status;
    if (status >= 300 && status < 400) {
      return false;
    }
    if (status === 400 || status === 404 || status === 412) {
      return false;
    }
    if (error.response?.status === 401) {
      // 401の場合はリトライ回数を、3回（デフォルトのリトライ回数） + 1回（トークンの再取得してからリトライ）とする
      if (failureCount >= 3) {
        // TODO 未認証とみなして、ログイン画面などに遷移
        return false;
      }
      // TODO IDトークンやアクセストークンの期限が切れた場合に、リフレッシュトークンを使用してトークンの再取得を実施
      return true;
    }
  }
  // デフォルトのリトライ回数は3回。1回目と2回目の場合は再度HTTPアクセスを実施
  return failureCount < 3;
};

const timeout = (queryClient: QueryClient, queryKey: QueryKey) => {
  return setTimeout(() => {
    queryClient
      .cancelQueries(queryKey)
      .then(() => {
        crashlytics().recordError(new Error('Http api connection timed out.'), 'HttpApiTimeout');
        Alert.alert('接続がタイムアウトしました。');
      })
      .catch((reason) => {
        crashlytics().recordError(new Error(reason), 'HttpApiCancelError');
      });
  }, 60000);
};
