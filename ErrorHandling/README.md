# ErrorHandling

React Nativeを使用したアプリのエラーハンドリングについて検証するプロジェクトです。

## グローバルエラーハンドリング

以下のケースにおいて、捕捉されていないエラーをハンドリングして、Firebase Crashlyticsにエラーログを送信できるかを検証しています。

* React Componentで発生したエラー
* ロジック（useEffectなど）内で発生したエラー
  * 同期処理
  * 非同期処理
* イベントハンドラで発生したエラー
  * 同期処理
  * 非同期処理
* Native Modulesで発生したエラー
  * 同期処理
  * 非同期処理

グローバルにエラーを捕捉する方法としては、以下のような方法があります。

| 方法 | 捕捉できるエラー |
|:----|:----|
| Error Boundary | ・React Componentで発生したエラー<br>・ロジック（useEffectなど）内で発生した同期処理のエラー |
| ErrorUtils | ・React Componentで発生したエラー<br>・ロジック（useEffectなど）内で発生した同期処理のエラー<br>イベントハンドラで発生した同期処理のエラー |
| ErrorUtils | ・React Componentで発生したエラー<br>・ロジック（useEffectなど）内で発生した同期処理のエラー<br>イベントハンドラで発生した同期処理のエラー |
| Thread.setDefaultUncaughtExceptionHandler（Androidのみ） | Native Modules内で発生したエラー |
| NSSetUncaughtExceptionHandler（iOSのみ） | Native Modules内でNSExceptionがthrowされた場合 |
| signal（iOSのみ） | シグナルを受け取った場合 |

上記方法で、エラーを捕捉できることを検証していますが、 現在コミットしているソースコードでは、独自でグローバルなエラーハンドリングを実施せず、全てFirebase Crashlytics側で処理する方法としています。
※ 上記方法の動作を確認したい場合は、必要に応じて該当箇所のコメントアウトを解除してください。

## WebViewで発生するエラーのハンドリング

以下のケースにおいて、エラーをハンドリングしてFirebase Crashlyticsにエラーログを送信できるかを検証しています。

* WebViewで表示するページを取得する際に、ステータスコード400以上が返却される場合
* ネットワークエラーなどによりWebViewで表示するページにアクセスできない場合

React Native WebViewの`onError`、`onHttpError`属性を使用してエラーをハンドリングします。

| 属性 | 捕捉できるエラー |
|:----|:----|
| onHttpError | WebViewで表示するページから、ステータスコード400以上が返却される場合 |
| onError | ネットワークエラーなどによりWebViewで表示するページにアクセスできない場合 |

## HTTP APIで発生するエラーのハンドリング

React Queryとaxiosを使用してHTTP APIにアクセスした場合に、共通でエラーハンドリングできるかを検証しています。

* HTTP APIから400以上のステータスコードが返却された場合
* ネットワークエラーなどによりHTTP APIにアクセスできない場合

また、1分以上HTTP APIから応答がない場合は、強制的に通信をキャンセルする方法についても検証しています。
    
## アプリの実行

【Android】
```bash
npm run android -- --variant Release
```

【iOS】
```bash
npm run ios -- --configuration Release
```

実行後に表示されるページでエラーを発生させると、アプリがクラッシュしてエラーログがFirebase Crashlyticsに送信されます。（WebViewとHTTP API通信については、個別にエラーハンドリングしているのでクラッシュしません。）
Firebase Crashlyticsにログが送信されるタイミングは、アプリがクラッシュした後に、再度アプリを起動した時になります。

なお、ReleaseモードではなくDebugモードでもアプリは動作しますが、Debugモードではエラー時にReact NativeがLogBoxにエラーログを表示する影響で、Firebase Crashlyticsにはログが送信されません。

iPhoneでアプリを実行するには、以下の手順が必要です。
* `PersonalAccount.xcconfig`を作成して、個人アカウントを設定する
  * 設定したら、`xed ios`で一回Xcodeプロジェクトを開いてください
* Firebase Consoleで、Bundle Identifierに個人のサフィックスを追加してアプリを追加する
* 追加したアプリでCrashlyticsを有効にする
* `GoogleService-Info.plist`をダウンロードして、`ios`ディレクトリに格納する

## HTTP API、WebViewからアクセスするHTTPサーバの起動

HTTP API、WebViewからアクセスするHttpサーバを起動します。
```bash
npm run http-server
```

## Firebase Crashlyticsのコンソールに表示されているスタックトレースとソースコードのマッピング

Firebase Crashlyticsのコンソールに表示されているJavaScriptで発生したエラーは、ソースマップが存在しないためエラー発生箇所が直感的にわからない表示となっています。

```
Fatal Exception: com.facebook.react.common.JavascriptException: Error: Error has occurred in synchronous process., stack:
<unknown>@855:884
<unknown>@677:2461
value@231:8208
value@231:7464
onResponderRelease@231:6218
p@96:384
b@96:527
T@96:581
w@96:876
ke@96:12621
forEach@-1
_@96:2057
<unknown>@96:12968
xe@96:89236
Se@96:12419
Re@96:12808
receiveTouches@96:13600
value@32:3350
<unknown>@32:747
value@32:2610
value@32:719
value@-1
```

ここでは、Firebase Crashlyticsのコンソールに表示されたJavaScriptのスタックトレースを、ソースコードとマッピングしてエラー発生箇所を特定する手順を記載します。

まず、以下のコマンドでソースマップを作成します。
```bash
npm run bundle
```

`[プロジェクトルート]/generated`に、`index.[android/ios].bundle.map`が作成されます。

次に、Firebase Crashlyticsのコンソールに表示されているスタックトレースをコピーして、任意のファイル、ディレクトリに格納します。
ここでは、`[プロジェクトルート]/stack-trace.txt`に保存する仮定とします。

次に、ソースマップを使って、スタックトレースとソースコードをマッピングします。

【Android】
```bash
cat stack-trace.txt | npm run symbolicate:ios
```

【iOS】
```bash
cat stack-trace.txt | npm run symbolicate:ios
```

実行後、以下のようなスタックトレースが標準出力され、エラー発生箇所がわかるようになります。
```
Fatal Exception: com.facebook.react.common.JavascriptException: Error: Error has occurred in synchronous process., stack:
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/src/screens/ErrorInEventHandler.tsx:8:useCallback$argument_0
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native-elements/dist/buttons/Button.js:35:useCallback$argument_0
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Pressability/Pressability.js:691:_performTransitionSideEffects
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Pressability/Pressability.js:628:_receiveSignal
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Pressability/Pressability.js:524:responderEventHandlers.onResponderRelease
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:32:invokeGuardedCallbackImpl
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:50:invokeGuardedCallback
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:63:invokeGuardedCallbackAndCatchFirstError
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:82:executeDispatch
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:976:executeDispatchesAndReleaseTopLevel
forEach@-1
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:155:forEachAccumulated
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:1007:batchedUpdates$argument_0
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:7566:batchedUpdatesImpl
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:957:batchedUpdates
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:988:_receiveRootNodeIDEvent
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js:1053:ReactNativePrivateInterface.RCTEventEmitter.register$argument_0.receiveTouches
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/BatchedBridge/MessageQueue.js:416:__callFunction
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/BatchedBridge/MessageQueue.js:109:__guard$argument_0
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/BatchedBridge/MessageQueue.js:364:__guard
~/dev/src/github.com/ws-4020/react-native-sandbox/ErrorHandling/node_modules/react-native/Libraries/BatchedBridge/MessageQueue.js:108:callFunctionReturnFlushedQueue
value@-1
```
