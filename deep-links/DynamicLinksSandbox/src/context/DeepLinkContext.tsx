import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import React, {useContext, useEffect, useState} from 'react';

interface ContextValueType {
  link?: FirebaseDynamicLinksTypes.DynamicLink;
}

export const DeepLinkContext = React.createContext<ContextValueType>({} as ContextValueType);

export const useDeepLinkContext = () => useContext(DeepLinkContext);

export const DeepLinkContextProvider: React.FC = ({children}) => {
  const [deepLink, setDeepLink] = useState<FirebaseDynamicLinksTypes.DynamicLink>();
  const handleLink = (link: FirebaseDynamicLinksTypes.DynamicLink) => {
    setDeepLink(link);
  };
  useEffect(() => {
    // forground
    const unsubscribe = dynamicLinks().onLink((link) => handleLink(link));
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
    return () => unsubscribe();
  }, []);

  const contextValue: ContextValueType = {
    link: deepLink,
  };

  return <DeepLinkContext.Provider value={contextValue}>{children}</DeepLinkContext.Provider>;
};
