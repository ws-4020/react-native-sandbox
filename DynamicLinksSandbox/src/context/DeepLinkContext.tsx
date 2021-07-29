import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import React, {useContext, useEffect, useState} from 'react';
import {Linking} from 'react-native';

interface ContextValueType {
  link?: FirebaseDynamicLinksTypes.DynamicLink;
  event?: string;
  createLink: (key: string, value: string) => Promise<string>;
}

export const DeepLinkContext = React.createContext<ContextValueType>({} as ContextValueType);

export const useDeepLinkContext = () => useContext(DeepLinkContext);

export const DeepLinkContextProvider: React.FC = ({children}) => {
  const [deepLink, setDeepLink] = useState<FirebaseDynamicLinksTypes.DynamicLink>();
  const [event, setEvent] = useState<string>();
  const links = dynamicLinks();
  const handleLink = (link: FirebaseDynamicLinksTypes.DynamicLink) => {
    setDeepLink(link);
  };

  const errorHandling = (e: any) => console.log(e);

  useEffect(() => {
    links
      .getInitialLink()
      .then((link) => {
        if (link) {
          handleLink(link);
          setEvent('initial link');
        }
      })
      .catch(errorHandling);
    // forground
    const unsubscribe = links.onLink((link) => {
      handleLink(link);
      setEvent('on link');
    });
    return () => unsubscribe();
  }, [links]);

  const contextValue: ContextValueType = {
    link: deepLink,
    event,
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
          // Deploy Gate App
          fallbackUrl: 'https://play.google.com/store/apps/details?id=com.deploygate&hl=ja&gl=US',
        },
      });
    },
  };

  return <DeepLinkContext.Provider value={contextValue}>{children}</DeepLinkContext.Provider>;
};
