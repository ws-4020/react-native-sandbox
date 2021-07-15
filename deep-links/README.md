# ディープリンク


## Android App Links && Universal Links

[Linking](https://reactnative.dev/docs/linking)を利用する。


## [Firebase Dynamic Links](https://firebase.google.com/docs/dynamic-links)


[React Native Firebase](https://rnfirebase.io/dynamic-links/usage)を利用する。
またドメインはpage-linkドメインを利用する。

## Androidの設定に関して

通常アプリケーションの開発時にはデバッグビルドを利用し、debug.storeが利用される。
これと、アップロード用鍵で作成した証明書の療法が利用できることを確認する。

```
debug.store  -> sha256 --> http://application/assetlinks.json
upload.store -> sha256 /
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
