# ディープリンク

## 環境構築

まずは標準の[環境セットアップ](https://github.com/ws-4020/rn-spoiler/blob/master/README.md)を参照してください。

Android向けとiOS向けにGoogleServiceの設定ファイルを配置します。

本来ならFirebaseでの設定手順のReferenceへのリンク。
  - Nativeのディープリンク（Android App LinksやUniversal Links)を利用する最低限の記載。
  - Dynamic Links時の設定（これらはPageLinkを利用するから必要なのか）
    - Applicationの登録
    - Android -> package name, keystoreのFinger Print
    - iOS     -> bundleId, App Store ID + TeamID

### Android

動作確認をする場合、ディープリンクを利用できる`debug.keystore`ではないので、Firebaseのアプリに登録しているフィンガープリントが一致するkeystoreを利用してください。

1. keystoreをダウンロード
1. `android/app/active_debug.keystore`で配置（あやまってコミットしないため）
1. `active_debug.keystore`を利用するように`android/app/build.gradle`を修正

1か2を実施せずに起動してしまった場合はアプリをUninstallしてください。（署名不一致でInstallできないため）

# ディープリンク

Dynamic Linksを利用して「アプリケーションを開くURLの作成」と「URLからアプリを起動できる設定」を検証する。

## 環境構築

ディープリンクを利用するための設定は「ドメインとアプリの関連付け」「iOSアプリ」「Androidアプリ」で構成される。

### ドメインとアプリの紐付け

Dynamic Linksを利用する場合Firebase Console上で作業する。

Firebase ConsoleのDynamic LinksのページでFirebaseの`page.link`のサブドメイン(`ws4020reactnativesandbox.page.link`)を利用してURLを作成し、アプリと紐付ける。

Firebase Console上でDynamic Linksを作成したら次のようなURLに関連情報が作成されていることを確認する。

- iOS: `https://${domain}/apple-app-site-association`
  (例: `https://ws4020reactnativesandbox.page.link/apple-app-site-association`)
- Android: `https://${domain}/.well-known/assetlinks.json`
  (例: `https://ws4020reactnativesandbox.page.link/.well-known/assetlinks.json`)

Customドメイン（たとえば`sandbox.ws-4020.mobile-app.com`など）も利用可能だが、`page.link`でユースケースを満たせているため検証していない。

### iOSアプリ

iOSでのドメインの関連付け（[Associated Domains](https://help.apple.com/developer-account/?lang=ja#/dev21218dfd6)）は高度な機能に含まれるため、ADPライセンスを利用する。
（作成したアプリケーションはTestFlightにて配信しているため、個別にソースを修正しない場合はそちらから取得すること。）

GoogleService-Info.plistをDownloadして設定する。

### Androidアプリ

紐付けに必要なリソースを配置してビルドする。

 - `google-services.json`をDownloadして`android/app`配下に配置する。
 - `active_debug.keystore`をDownloadして`android/app`配下に配置する。
    - `build.gradle`で参照しているkeystoreを`active_debug.keystore`に変更する。
    - リポジトリにある`debug.keystore`では署名が異なるため、ドメインの関連付けはできない。

## ユースケース

- Firebase Console上で作成したURLでアプリケーションが起動する。
- アプリが作成したURLを共有してアプリが起動する。
- 未インストール時はAndroidはDeploy GateにてAPKファイル、iOSはTestFlightに遷移してインストール後に起動してもらう。

いずれの場合もURLからアプリケーションに遷移した場合に、Linkの情報を取得してアプリで確認できる。

### インストール後に別のURLを利用

招待コードを受け取るときに以下のケースを考えてみる。

1. 1回目の招待コードを利用したURLを未インストールのユーザに送る。
1. 受け取ったユーザは5日間の長期休暇をとっていたため、有効期限が切れたDynamic Linkでアプリをインストールする。
1. 招待したユーザは有効期限が切れていることを検知していたため、招待コードを再発行してURLをユーザに送る。
1. 長期休暇開けのメンバーは3で発行されたURLをタップする。

このとき、ユーザは最新のURLをアプリで受け取る必要があるが、古い（1回目）URLを受けとってしまう。
これは未インストール時にFirebaseが生成しているWebページでクリップボードにURLを設定し、インストール後はクリップボードの内容が更新されないため、インストール時のURLがアプリに渡されてしまうためである。

詳しくは[オペレーティングシステムを統合する](https://firebase.google.com/docs/dynamic-links/operating-system-integrations)のiOSフローチャートを参照。

|No|アプリ起動|起動回数|クリップボード|利用されるデータ|
|:-|:-------|:-----|:----|
|1|リンクをタップ|０|有|クリップボード|
|2|リンクをタップ|０|なし|リンク|
|3|リンクをタップ|１以上|有|リンク|
|4|リンクをタップ|１以上|なし|リンク|
|5|アイコンタップ|０|有|クリップボード|
|6|アイコンタップ|０|なし|ー|
|7|アイコンタップ|１以上|有|ー|
|8|アイコンタップ|１以上|なし|ー|

No1のときに一度も起動していないがリンクをタップしてアプリを起動したときにタップしたリンクではなくクリップボードの値が利用される。

 - [SDKの設定](https://firebase.google.com/docs/dynamic-links/ios/receive)でコピー機能をOFFにしてインストール後の起動時にはHome画面を表示して、再度リンクを踏んで貰うようにガイドする。
 - 該当の動作は許容して、URL発行時や招待コードでの有効期限エラーで工夫をする。

リトライしてもらうことはユーザに大きな負担をかけないため、許容する。

### ライセンスによる制限

「ドメインの関連付け」を利用しないでもアプリケーションの起動はGoogleService-Info.plistのbundleIdと比較していないので個人開発者アカウントでURLの作成可能である。

開発用のGoogleService-Info.plistとgoogle-service.jsonを作成しSDKを設定してから開発者に配布すればよい。

### 未検証ポイント

- GooglePlay、 AppStoreを利用
- Webサイトの構築
- Androidアプリを複数作成

#### Google Play、App Storeを利用

アプリを公開できていないため、未インストール時にStoreに誘導することは未検証。
そのため、Google Playの内部テスト版での検証などもできていない。
ただし、アプリのリンク作成時に `fallbackUrl` を設定するためビルドバリアントで切り替えるようにすれば対応できる想定。

#### Webサイトの構築

本来はユーザがWebサイトにアクセスするか、アプリで起動するかを選択できる。
今回はWebサイトを用意していないため検証していないが、Webサイト側でブラウザからアクセスされたときにアプリのFallbackURLにリダイレクトする必要があるかもしれない。

#### Androidアプリを複数作成

通常アプリケーションの開発時にはデバッグビルドを利用し、debug.storeが利用される。
これと、アップロード用鍵で作成した証明書の療法が利用できることを確認する。

```
debug.store  -> sha256 -+-> http://application/assetlinks.json
test.store   -> sha256 -|
upload.store -> sha256 _|
```

## 未インストールのStep

### TestFlightで利用する

アプリがインストールされていない場合のURLをTestFlightに向けておけばインストールはできる。

  1. TestFlightをインストール
  1. TestFlightからアプリをインストール
  1. URLを取得

ただし取得されるURLがTestFlightのURLになってしまうので、Firebaseに記憶させるURLを工夫すればできるかもしれない。

 1. linkを作成
 1. アプリがインストールしていないURLをTestFlightに設定
 1. TestFlight経由でAppがインストールされれば該当のURLがモバイルアプリで取得できる

### Androidで利用する

アプリがインストールされていない場合のURLをDeploy Gateにむければできる。

 1. linkを作成
 1. アプリがインストールされていないURLをDeploy Gate AppのURLにする
 1. インストール手順にしたがい、インストール
 1. アプリを起動

## Dynamicリンクを作成する

Dynamic Linksを作成するには4つのパターンがある。

- Firebase Console上で作成する

Firebase Consoleにアクセスして エンゲージメント > Dynamic Linksから作成する。
設定ファイルの作成や検証のために、まずはここから開始する。

### Firebase Dynamic Link Builder APIを利用する

今回のアプリケーションで実装している。

### REST API

Dynamic Links用のWebAPIキーを使用して、つぎのようなLinkを作成する。
アプリからURLを作成しないケースなので利用しないが、アプリ外で作成する場合に使用する。

 - 長いリンクから短いリンクを作成する
 - パラメータから短いリンクを作成する
 - 短いダイナミック リンクの長さを設定する

### マニュアル

Firebase Consoleにアクセスできない(Web APIキーも渡せない)関係者にURLを作成してもらうパターンくらいしか思いつかない。

- iOSは`https://your_subdomain.page.link/?link=your_deep_link&ibi=bundleId&ifl=appLandingPageUrl`となる。
- Androidは`https://your_subdomain.page.link/?link=your_deep_link&apn=package_name`となる。

詳細なパラメータは[手動で作成する](https://firebase.google.com/docs/dynamic-links/create-manually)を参照。
