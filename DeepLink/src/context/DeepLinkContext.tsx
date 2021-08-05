import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Linking, Platform} from 'react-native';

interface ContextValueType {
  link?: FirebaseDynamicLinksTypes.DynamicLink;
  event?: string;
  createLink: (key: string, value: string) => Promise<string>;
}

export const DeepLinkContext = React.createContext<ContextValueType>({} as ContextValueType);

export const useDeepLinkContext = () => useContext(DeepLinkContext);

export const DeepLinkContextProvider: React.FC = ({children}) => {
  const [link, setLink] = useState<FirebaseDynamicLinksTypes.DynamicLink>();
  const [event, setEvent] = useState<string>();

  const errorHandling = useCallback((e: any) => console.log(e), []);

  const setSafeLink = (link: FirebaseDynamicLinksTypes.DynamicLink | null, event: string) => {
    if (!link) {
      return;
    }
    if (Platform.OS !== 'ios' || link?.matchType === 3) {
      setLink(link);
      setEvent(event);
    } else {
      setEvent(`unsafe link (${link.matchType ? link.matchType : 'no match type'})`);
    }
  };

  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        setSafeLink(link, 'initialLink');
      })
      .catch(errorHandling);
    // forground
    const unsubscribe = dynamicLinks().onLink((url) => {
      if (url) {
        setSafeLink(url, 'dynamic on link');
      }
    });
    Linking.addEventListener('url', (url) => {
      if (url) {
        dynamicLinks()
          .resolveLink(url.url)
          .then((link) => {
            setSafeLink(link, 'on link');
          })
          .catch(errorHandling);
      }
    });
    return () => {
      Linking.removeAllListeners('url');
      unsubscribe();
    };
  }, [errorHandling]);

  const contextValue: ContextValueType = {
    link,
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
