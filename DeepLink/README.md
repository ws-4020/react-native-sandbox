# ディープリンク

Dynamic Linksを利用して「ディープリンクのURLの作成」と「URLからアプリを起動する方法」を検証します。

 - 招待コードを含むディープリンクの作成：ディープリンクのURLの作成
 - QRコードを読み取ってアプリを起動：URLからアプリを起動する方法

またアプリケーションがディープリンクを利用するための環境構築で必要なことをまとめます。

## 環境構築

ディープリンクを利用するためには「ドメインとアプリの関連付け」「iOSアプリ」「Androidアプリ」を設定します。

### ドメインとアプリの紐付け

Firebase ConsoleのDynamic LinksのページでFirebaseの`page.link`のサブドメイン(`ws4020reactnativesandbox.page.link`)を利用してURLを作成し、アプリと紐付けます。

Firebase Console上でDynamic Linksを作成したら次のようなURLに関連情報が作成されていることを確認します。

- iOS: `https://${domain}/apple-app-site-association`
  (例: `https://ws4020reactnativesandbox.page.link/apple-app-site-association`)
- Android: `https://${domain}/.well-known/assetlinks.json`
  (例: `https://ws4020reactnativesandbox.page.link/.well-known/assetlinks.json`)

カスタムドメイン（たとえば`sandbox.ws-4020.mobile-app.com`など）も利用可能ですが、`page.link`でユースケースを満たせているため検証していません。

### iOSアプリ

iOSでのドメインの関連付け（[Associated Domains](https://help.apple.com/developer-account/?lang=ja#/dev21218dfd6)）は高度な機能に含まれるため、ADPライセンスを利用します。
（作成したアプリケーションはTestFlightにて配信しているため、個別にソースを修正しない場合はそちらから取得してください。）

GoogleService-Info.plistをDownloadして設定します。

- `GoogleService-Info.plist`をDonwloadして`ios/DeepLink`配下に配置します。
- Xcodeを起動し、File > Add New File to DeepLinkで配置した`GoogleService-Info.plist`を選択します。

### Androidアプリ

紐付けに必要なリソースを配置してビルドします。

 - `google-services.json`をDownloadして`android/app`配下に配置します。
 - `active_debug.keystore`をDownloadして`android/app`配下に配置します。
    - `build.gradle`で参照しているkeystoreを`active_debug.keystore`に変更します。
    - リポジトリにある`debug.keystore`では署名が異なるため、ドメインの関連付けはできません。

## Linkの取得

ユーザがURLをタップしたときにURLを取得するには「アプリの状態」毎に次の通りに実装することで実現できます。

|アプリの状態|利用するメソッド|備考|
|:---------|:------------|:---|
|Cold Start| firebase.getInitialLink| firebase.getInitialLinkには[issue](https://github.com/invertase/react-native-firebase/issues/2660)があるためLinking.getInitialURLをresolveします|
|バックグラウンド|firebase.onLink|[オペレーティングシステムを統合する](https://firebase.google.com/docs/dynamic-links/operating-system-integrations)のためにfirebaseのライブラリを利用します|
|フォアグラウンド|firebase.resolve[^1]|Linking.openではブラウザが開くためUXの点から採用しません。Linking.emitはfirebaseの内部実装（キー）に依存するため採用しません。|

[^1]: ディープリンクの機能を利用せず、アプリ内で処理します。そのときDynamic Linksの中に含まれるlinkを取得するためにresolveを利用します。

## ユースケース

- アプリが作成したURLを共有して、起動したアプリに情報を渡す。
- アプリを未インストールの状態でURLをタップする。
  - 未インストール時はAndroidはDeploy GateにてAPKファイル、iOSはTestFlightに遷移してインストール後に起動する。

いずれの場合もURLからアプリケーションに遷移した場合に、Linkの情報を取得してアプリで確認できます。
詳しくは[オペレーティングシステムを統合する](https://firebase.google.com/docs/dynamic-links/operating-system-integrations)のiOSフローチャートを参照してください。

### iOSでのオペレーティング・システムの統合

下記表は未インストール状態でURLを開き、`preview.page.link`のWebページで`OPEN`ボタンを押した状態で検証しています。
未インストール状態で`OPEN`ボタンを押したときのURLを"`page.link`URL"と表記しています。

`page.link`URLは下記表以外のどういう条件で利用されるか（いつまで有効かなど）の調査はしていませんが、デバイスのIP変更（Wifi接続への変更）で無効になることは確認しています。

下記表はアプリが起動していないときの起動パターンとアプリが受け取るディープリンクの一覧です。

- 「リンクをタップ」はアプリがインストールされている状態でCold Startした場合です。
- 「アプリアイコンをタップ」はディープリンクによるアプリ起動ではなく、アプリアイコンをタップ（もしくはTestFlightでインストール後に「起動」）した場合です。
- クリップボード
   - 展開URL(`https://ws4020reactnativesandbox.page.link/?link=https://sample.domain/app?...`形式)
   - ShortURL(`https://ws4020reactnativesandbox.page.link/NNNN`形式でSDKなどで展開する必要がある)
   - その他データ(URL形式ではないもの)
   - なし（クリップボードにデータなし）

|No|アプリ起動|起動回数|クリップボード|iOS利用されるデータ|matchType|event|
|:-|:-------|:-------|:-----|:----|:----|:----|
|1|リンクをタップ|0|展開URL|起動時のリンク|unique|initialLink|
|2|リンクをタップ|0|ShortURL|起動時のリンク|unique|initialLink|
|3|リンクをタップ|0|その他データ|起動時のリンク|unique|initialLink|
|4|リンクをタップ|0|なし|起動時のリンク|unique|initialLink|
|5|リンクをタップ|1以上|正規URL|起動時のリンク|unique|initialLink|
|6|リンクをタップ|1以上|なし|起動時のリンク|unique|initialLink|
|7|リンクをタップ|1以上|ShortURL|起動時のリンク|unique|initialLink|
|8|リンクをタップ|1以上|その他データ|起動時のリンク|unique|initialLink|
|9|アプリアイコンをタップ|0|展開URL|クリップボード|unique|onLink|
|10|アプリアイコンをタップ|0|ShortURL|`page.link`URL|not unique|onLink|
|11|アプリアイコンをタップ|0|その他データ|`page.link`URL|not unique|onLink|
|12|アプリアイコンをタップ|0|なし|`page.link`URL|not unique|onLink|
|13|アプリアイコンをタップ|1以上|展開URL|-|-|-|
|14|アプリアイコンをタップ|1以上|ShortURL|-|-|-|
|15|アプリアイコンをタップ|1以上|その他データ|-|-|-|
|16|アプリアイコンをタップ|1以上|なし|-|-|-|

No10ではShortURLをクリップボードから取得する（iOS14以降の通知がでる）が利用されずに`page.link`を利用します。

リトライしてもらうことはユーザに大きな負担をかけないため、許容します。

### ライセンスによる制限

「ドメインの関連付け」にはADPかADEPが必要なので、実際にリンクからアプリケーションを起動するテストをするには、ADPかADEPでビルドしたアプリケーションが必要です。

ただし、個人開発者アカウントでビルドした場合でもアプリケーションの起動はできるので、リンクからアプリケーションを起動するユースケースを含まない部分であれば、個人開発者アカウントで開発できます。

そのため、開発用のGoogleService-Info.plistとgoogle-service.jsonを作成しSDKを設定してから開発者に配布しても、開発者全員に配布用証明書を提供する必要はありません。

### 未検証ポイント

- GooglePlay、 AppStoreを利用
- Webサイトの構築
- Androidアプリを複数作成

#### Google Play、App Storeを利用

アプリを公開できていないため、未インストール時にStoreに誘導することは未検証です。
Deploy Gateでの検証をしていますが、Google Playの内部テスト版での検証などもできていないません。

ストアに誘導する場合は、アプリ内でDynamic Linkを作成する時に指定する `fallbackUrl` にストアのURLを設定することで対応できる想定です。ビルドバリアントでこの`fallbackUrl`を切り替えることで、本番リリース用ビルドバリアントでビルドされたアプリではストアに誘導し、他環境では異なるURLに誘導するように設定できます。

#### Webサイトの構築

本来はユーザがWebサイトにアクセスするか、アプリで起動するかを選択できます。
今回はWebサイトを用意していないため検証していないが、Webサイト側でブラウザからアクセスされたときにアプリのFallbackURLにリダイレクトする必要があるかもしれません。

#### Androidアプリを複数作成

通常アプリケーションの開発時にはデバッグビルドを利用し、debug.storeが利用されます。
これと、アップロード用鍵で作成した証明書の療法が利用できることを確認する必要があります。

```
debug.store  -> sha256 -+-> http://application/assetlinks.json
test.store   -> sha256 -|
upload.store -> sha256 _|
```

## 開発フェーズのオペレーティングシステムの統合

未公開アプリを使ってディープリンクを利用する方法を検証します。

### TestFlightを利用する

アプリがインストールされていない場合のURLをTestFlightに向けておけばインストールできます。

  1. TestFlightをインストール
  1. TestFlightからアプリをインストール
  1. URLを取得

### DeployGateを利用する

アプリがインストールされていない場合のURLをDeploy Gateに向ければインストールできます。

 1. linkを作成
 1. アプリがインストールされていないURLをDeploy Gate AppのURLにする
 1. インストール手順にしたがい、インストール
 1. アプリを起動

## Dynamicリンクを作成する

Dynamic Linksを作成するには4つのパターンがあります。

- Firebase Console上で作成する

Firebase Consoleにアクセスして エンゲージメント > Dynamic Linksから作成します。
設定ファイルの作成や検証のために、まずはここから開始すると問題の切り分けができます。

### Firebase Dynamic Link Builder APIを利用する

今回のアプリケーションで実装しています。

### REST API

Dynamic Links用のWebAPIキーを使用して、つぎのようなLinkを作成します。
アプリからURLを作成しないケースなので利用しないが、アプリ外で作成する場合に使用すると想定されます。
今回は未検証です。

 - 長いリンクから短いリンクを作成する
 - パラメータから短いリンクを作成する
 - 短いダイナミック リンクの長さを設定する

### マニュアル

Firebase Consoleにアクセスできない(Web APIキーも渡せない)関係者にURLを作成してもらう、というケースくらいしか思いつかないパターンです。
今回は未検証です。

- iOSは`https://your_subdomain.page.link/?link=your_deep_link&ibi=bundleId&ifl=appLandingPageUrl`
- Androidは`https://your_subdomain.page.link/?link=your_deep_link&apn=package_name`

詳細なパラメータは[手動で作成する](https://firebase.google.com/docs/dynamic-links/create-manually)を参照してください。

## 検証アプリの環境構築

まずは標準の[環境セットアップ](https://github.com/ws-4020/rn-spoiler/blob/master/README.md)を参照してください。

Android向けとiOS向けにGoogleServiceの設定ファイルを配置します。

### Androidのkeystore

動作確認をする場合、ディープリンクを利用できる`debug.keystore`ではないので、Firebaseのアプリに登録しているフィンガープリントが一致するkeystoreを利用してください。

1. keystoreをダウンロード
1. `android/app/active_debug.keystore`で配置（あやまってコミットしないため）
1. `active_debug.keystore`を利用するように`android/app/build.gradle`を修正

1か2を実施せずに起動してしまった場合はアプリをUninstallしてください。（署名不一致でInstallできないため）

