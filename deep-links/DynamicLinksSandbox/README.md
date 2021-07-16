# DynamicLinksSandbox

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