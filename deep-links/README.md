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

