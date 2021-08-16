import axios, {AxiosPromise, CancelToken, Method} from 'axios';
import {Platform} from 'react-native';

const baseHost = Platform.select({
  default: 'localhost',
  android: '10.0.2.2',
});

const defaultInstance = axios.create({
  baseURL: `http://${baseHost}:3000`,
});

export class HttpApiClient {
  constructor(private readonly client = defaultInstance) {}

  get<T>(path: string): CancelableAxiosPromise<T> {
    return this.requestWithCancellation(path, 'GET');
  }

  post<T>(path: string, data?: any, token?: CancelToken): AxiosPromise<T> {
    return this.requestWithCancellation(path, 'POST', data);
  }

  requestWithCancellation<T>(url: string, method: Method, data?: unknown) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const promise = axios.request({url, method, data, cancelToken: source.token});
    // React Queryでは、promise.cancelを使用して通信をキャンセルする
    // https://react-query.tanstack.com/guides/query-cancellation
    // @ts-ignore
    promise.cancel = () => {
      source.cancel('Query was cancelled by React Query');
    };
    return promise as CancelableAxiosPromise<T>;
  }
}

export interface CancelableAxiosPromise<T = any> extends AxiosPromise<T> {
  cancel: () => void;
}
