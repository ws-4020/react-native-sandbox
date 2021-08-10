#!/bin/bash

pushd ..
cp patch-files/RNFBDynamicLinks* node_modules/@react-native-firebase/dynamic-links/ios/RNFBDynamicLinks/
npx patch-package @react-native-firebase/dynamic-links
npx pod-install
popd

