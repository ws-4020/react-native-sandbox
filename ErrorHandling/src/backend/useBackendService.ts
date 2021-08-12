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
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      const promise = httpApiClient.get<TData>(pathFn(context.queryKey), source.token);
      // @ts-ignore
      promise.cancel = () => {
        source.cancel('Query was cancelled by React Query');
      };
      const timeoutObj = timeout(queryClient, queryKey);
      try {
        return (await promise).data;
      } finally {
        clearTimeout(timeoutObj);
      }
    },
    {
      onError: (err) => _onError(err),
      retry: _retry,
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
      retry: _retry,
      ...options,
    },
  );
};

const _onError = (error: AxiosError<ErrorResponse>) => {
  if (error.response?.status) {
    if (error.response?.status === 400) {
      // 何もしない
    } else if (error.response?.status === 401) {
      // TODO 未認証とみなして、ログイン画面などに遷移
    } else if (error.response?.status === 404) {
      // 何もしない
    } else if (error.response?.status === 412) {
      Alert.alert('アプリを新しいバージョンにアップデートしてください。');
    } else if (error.response?.status === 429) {
      Alert.alert('只今混み合っています。しばらくしてから再度お試しください。');
    } else if (error.response?.status === 503) {
      Alert.alert('システムメンテナンス中です。');
    } else {
      Alert.alert('予期しない例外が発生しました。');
    }
  } else {
    Alert.alert('端末のネットワークを確認してください。');
  }
};

const _retry = (failureCount: number, error: AxiosError<ErrorResponse>) => {
  if (error.response?.status) {
    const status = error.response?.status;
    if (status === 400 || status === 404 || status === 412) {
      return false;
    }
    if (error.response?.status === 401) {
      if (failureCount === 0) {
        // TODO IDトークンやアクセストークンの期限が切れた場合に、リフレッシュトークンを使用してトークンの再取得を実施
        return true;
      }
      // TODO 未認証とみなして、ログイン画面などに遷移
      return false;
    }
  }
  return failureCount !== 2;
};

const timeout = (queryClient: QueryClient, queryKey: QueryKey) => {
  return setTimeout(() => {
    queryClient
      .cancelQueries(queryKey)
      .then(() => {
        Alert.alert('接続がタイムアウトしました。');
      })
      .catch((reason) => {
        console.log(reason);
      });
  }, 5000);
};
