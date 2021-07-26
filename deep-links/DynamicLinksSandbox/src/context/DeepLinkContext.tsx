import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import React, {useContext, useEffect, useState} from 'react';

interface ContextValueType {
  link?: FirebaseDynamicLinksTypes.DynamicLink;
  createLink: (key: string, value: string) => Promise<string>;
}

export const DeepLinkContext = React.createContext<ContextValueType>({} as ContextValueType);

export const useDeepLinkContext = () => useContext(DeepLinkContext);

export const DeepLinkContextProvider: React.FC = ({children}) => {
  const [deepLink, setDeepLink] = useState<FirebaseDynamicLinksTypes.DynamicLink>();
  const handleLink = (link: FirebaseDynamicLinksTypes.DynamicLink) => {
    setDeepLink(link);
  };
  useEffect(() => {
    // When the component is unmounted, remove the listener
    // background
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link) {
          handleLink(link);
        }
      })
      .catch((e) => {
        console.log(e);
      });
    // forground
    const unsubscribe = dynamicLinks().onLink((link) => handleLink(link));
    return () => unsubscribe();
  }, []);

  const contextValue: ContextValueType = {
    link: deepLink,
    createLink: async (key, value) => {
      return dynamicLinks().buildShortLink({
        link: `https://sample.domain/app?${key}=${value}`,
        domainUriPrefix: `https://ws4020reactnativesandbox.page.link/`,
        ios: {
          bundleId: 'ws4020.reactnative.sandbox',
          fallbackUrl: 'https://apps.apple.com/jp/app/testflight/id899247664', // testflight or app store
        },
        android: {
          packageName: 'ws4020.reactnative.sandbox',
          // Azure Blob Storage SAS or Play Store
          fallbackUrl:
            'https://reactnativesandbox.blob.core.windows.net/$web/deeplink/app-release.apk?sp%3Dr%26st%3D2021-07-21T06:08:55Z%26se%3D2021-09-30T14:08:55Z%26spr%3Dhttps%26sv%3D2020-08-04%26sr%3Db%26sig%3DHzBNBurG1AaA55cBaUGD824Xe7MTfYunV%252Fi0YVIOviY%253D',
        },
      });
    },
  };

  return <DeepLinkContext.Provider value={contextValue}>{children}</DeepLinkContext.Provider>;
};
