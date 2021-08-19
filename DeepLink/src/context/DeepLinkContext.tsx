import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Linking, Platform} from 'react-native';

interface ContextValueType {
  link?: FirebaseDynamicLinksTypes.DynamicLink;
  event?: string;
  createLink: (key: string, value: string) => Promise<string>;
  setShortLink: (url: string) => void;
}

export const DeepLinkContext = React.createContext<ContextValueType>({} as ContextValueType);

export const useDeepLinkContext = () => useContext(DeepLinkContext);

export const DeepLinkContextProvider: React.FC = ({children}) => {
  const [link, setLink] = useState<FirebaseDynamicLinksTypes.DynamicLink>();
  const [event, setEvent] = useState<string>();

  const errorHandling = useCallback((e: any) => console.log(e), []);

  const setSafeLink = (event: string, link?: FirebaseDynamicLinksTypes.DynamicLink) => {
    if (!link) {
      return;
    }
    if (Platform.OS !== 'ios' || link?.matchType === 3) {
      setLink(link);
      setEvent(event);
    } else {
      setEvent(`unsafe link (${link.matchType ? link.matchType : 'no match type'}) in ${event}`);
      setLink(link);
    }
  };

  const setShortLink = (shortLink: string) => {
    setUnresolvedURL(shortLink, 'on App');
  };

  const setUnresolvedURL = useCallback(
    (url: string, event: string) => {
      dynamicLinks()
        .resolveLink(url)
        .then((link) => {
          setSafeLink(event, link);
        })
        .catch(errorHandling);
    },
    [errorHandling],
  );

  useEffect(() => {
    // https://github.com/invertase/react-native-firebase/issues/2660
    // dynamicLinks().getInitialLink()は起動が早いと動かないため、Linkingを利用する。
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          setUnresolvedURL(url, 'initial Link');
        }
      })
      .catch(errorHandling);
  }, [setUnresolvedURL, errorHandling]);

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink((url) => {
      if (url) {
        setSafeLink('dynamic on link', url);
      }
    });
    return unsubscribe;
  }, []);

  const contextValue: ContextValueType = {
    link,
    event,
    setShortLink,
    createLink: async (key, value) => {
      const encodedKey = encodeURI(key);
      const encodedValue = encodeURI(value);
      return dynamicLinks().buildShortLink(
        {
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
        },
        FirebaseDynamicLinksTypes.ShortLinkType.DEFAULT,
      );
    },
  };

  return <DeepLinkContext.Provider value={contextValue}>{children}</DeepLinkContext.Provider>;
};
