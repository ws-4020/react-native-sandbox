import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useState, useEffect} from 'react';
import {Home, DeepLink} from 'screens';

const nav = createStackNavigator();
export const RootStackNav: React.FC = () => {
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

  return (
    <nav.Navigator initialRouteName={deepLink ? Home.name : DeepLink.name}>
      <nav.Screen name="Home" component={Home} options={{headerShown: false}} />
      <nav.Screen name="DeepLink" component={DeepLink} />
    </nav.Navigator>
  );
};
