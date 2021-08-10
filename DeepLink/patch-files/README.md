# ReactNativeFirebase DynamicLinksのパッチ

@react-native-firebase/dynamic-linksのパッチです。

修正した場合は、`node_modules/@react-native-firebase/dynamic-links/ios/RNFBDynamicLinks` へ配置したあとに `npx patch-package @react-native-firebase/dynamic-links`でパッチを作成します。

```
cd ..
cp patch-files/RNFBDynamicLinks* node_modules/@react-native-firebase/dynamic-links/ios/RNFBDynamicLinks/
npx patch-package @react-native-firebase/dynamic-links
npx pod-install
```
