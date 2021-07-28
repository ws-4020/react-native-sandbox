import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import React, {useContext, useEffect, useState} from 'react';
import {Linking} from 'react-native';

interface ContextValueType {
  link?: FirebaseDynamicLinksTypes.DynamicLink;
  event?: string;
  debugLink?: string;
  createLink: (key: string, value: string) => Promise<string>;
}

export const DeepLinkContext = React.createContext<ContextValueType>({} as ContextValueType);

export const useDeepLinkContext = () => useContext(DeepLinkContext);

export const DeepLinkContextProvider: React.FC = ({children}) => {
  const [deepLink, setDeepLink] = useState<FirebaseDynamicLinksTypes.DynamicLink>();
  const [event, setEvent] = useState<string>();
  const [debugLink, setDebugLink] = useState<string>();
  const handleLink = (link: FirebaseDynamicLinksTypes.DynamicLink) => {
    setDeepLink(link);
  };

  const logging = (e: any) => console.log(e);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {})
      .catch(logging);
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link) {
          handleLink(link);
          setEvent('initial link');
        }
      })
      .catch(logging);
    // forground
    const unsubscribe = dynamicLinks().onLink((link) => {
      handleLink(link);
      setEvent('on link');
      console.log('onLink', link);
    });
    return () => unsubscribe();
  }, []);

  const contextValue: ContextValueType = {
    link: deepLink,
    event,
    debugLink,
    createLink: async (key, value) => {
      const encodedKey = encodeURI(key);
      const encodedValue = encodeURI(value);
      return dynamicLinks().buildShortLink({
        link: `https://sample.domain/app?${encodedKey}=${encodedValue}`,
        domainUriPrefix: `https://ws4020reactnativesandbox.page.link`,
        ios: {
          bundleId: 'ws4020.reactnative.sandbox',
          fallbackUrl: 'https://apps.apple.com/jp/app/testflight/id899247664', // testflight or app store
        },
        android: {
          packageName: 'ws4020.reactnative.sandbox',
          // Azure Blob Storage SAS or Play Store
          fallbackUrl:
            'https://reactnativesandbox.blob.core.windows.net/$web/deeplink/app-release.apk?sp=r&st=2021-07-26T08:29:47Z&se=2021-07-26T16:29:47Z&spr=https&sv=2020-08-04&sr=b&sig=9Dsx94zE00GIz6hs%2Bfa8rxmQK4mKeuzDjA3eZnkYunw%3D',
        },
      });
    },
  };

  return <DeepLinkContext.Provider value={contextValue}>{children}</DeepLinkContext.Provider>;
};
