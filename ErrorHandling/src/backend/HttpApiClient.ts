import axios, {AxiosPromise, CancelToken} from 'axios';
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

  get<T>(path: string, token?: CancelToken): AxiosPromise<T> {
    return this.client.get<T>(path, {
      cancelToken: token,
    });
  }

  post<T>(path: string, data?: any, token?: CancelToken): AxiosPromise<T> {
    return this.client.post<T>(path, data, {
      cancelToken: token,
    });
  }
}
