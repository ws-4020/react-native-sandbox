# ディープリンク

## 開発時に必要なリソース

### Android

ドメインとassetlinks.jsonが必要。

assetlinks.jsonには`SHA-256`のフィンガープリントが必要なので開発やテストで利用するkeystoreの管理も必要。
たとえば開発時の`debug.keystore`をRepositoryにpushする場合はRepositoryにある`keystore`をもとに署名した`assetlinks.json`でよい。

keystoreを１つにしない場合はディープリンクの検証する分の`keystore`を署名する必要がある。

開発者が自由に署名してしまうと野良アプリケーションに乗っ取られるリスクが有るため、テストや本番運用時には`assetlinks.json`に署名する`keystore`は制限する必要がある。

このとき環境に応じてドメインを複数使って運用する方法もあるが、Manifestファイルに開発用のドメインが含まれてしまうため、リリースのときに削除する運用が必要（になるかもしれないが、ここは調査）。

### iOS

ドメインとの関連付けはADPまたはADEPライセンスが必要である。（個人開発者ライセンスでは利用できない。）

Singinのためにデバイスの登録と開発用証明書、プロビジョニングファイルが必要になる。

### Dynamic Linksの場合

App Store IDが必要になる。（これを設定しないとpage.linkドメインの`apple-app-site-association`に設定されない。）


## Android App Links && Universal Links

[Linking](https://reactnative.dev/docs/linking)を利用する。


## [Firebase Dynamic Links](https://firebase.google.com/docs/dynamic-links)


[React Native Firebase](https://rnfirebase.io/dynamic-links/usage)を利用する。
またドメインはpage-linkドメインを利用する。

## Androidの設定に関して

通常アプリケーションの開発時にはデバッグビルドを利用し、debug.storeが利用される。
これと、アップロード用鍵で作成した証明書の療法が利用できることを確認する。

```
debug.store  -> sha256 -+-> http://application/assetlinks.json
test.store   -> sha256 -|
upload.store -> sha256 _|
```

## iOSとライセンス

アプリがインストールされていない場合にインストールし、インストール後にURLに該当するコンテンツに遷移するケースをどうやってテストするか。

iOSのライセンスは2パターン。両方利用するとBundleIdかわるのでFirebaseにアプリ2つ追加して
対象のDomainも2つ用意してURLもみたいなことになる。

しかもアプリ構築時にライセンスに応じてドメインを変更するっていことをサーバでやったり、アプリでやるとなるとなかなか厳しい。

-> Deploy Gateで試すならADEP
-> Store配信するならADP

内部テスターでやればいいし、ADPでやる。

### 開発時個人端末を登録するか？

デバイスの登録が必要となるとライセンス全体の話が出てくる。
個人アカウントを使った方法を考えてもAppStoreIdが必要な時点で配布ができない個人アカウントは不可。
なのでデバイスの登録が必要。

bundleId毎にURLを作成すればいける？

## 個人の開発でディープリンクを利用する

Dynamic Linksを利用してしまうとAppStoreへの登録をしてFirebase Applicationと紐付けないと`apple-app-site-association`が作成されない。

これをマニュアルで作成できないとApplicationとApplinksの検証ができない。（URLのホスト側からアプリケーションを信頼できない。）

Androidは配布用証明書のキーのフィンガープリント取らないと`/.well-known/applinks.json`に登録されない？

アプリに[debugの用のkeystore](https://developers.google.com/android/guides/client-auth#using_keytool)からFingerPrintとれば登録される。

アプリ認証用のSHA-1とAndroid App Links用のSHA-256を取得して登録する。
