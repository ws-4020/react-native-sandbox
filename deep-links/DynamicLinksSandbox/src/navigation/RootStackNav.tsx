import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';
import {createStackNavigator} from '@react-navigation/stack';
import {useDeepLinkContext} from 'context';
import React, {useState, useEffect} from 'react';
import {Home, DeepLink} from 'screens';

const nav = createStackNavigator();
export const RootStackNav: React.FC = () => {
  const {link} = useDeepLinkContext();
  console.log(link);
  return (
    <nav.Navigator initialRouteName={link ? DeepLink.name : Home.name}>
      <nav.Screen name="Home" component={Home} options={{headerShown: false}} />
      <nav.Screen name="DeepLink" component={DeepLink} />
    </nav.Navigator>
  );
};
