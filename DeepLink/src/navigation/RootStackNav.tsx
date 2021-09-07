import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {DeepLink, Home} from 'screens';

const nav = createStackNavigator();
export const RootStackNav: React.FC = () => {
  return (
    <nav.Navigator initialRouteName={Home.name}>
      <nav.Screen name="Home" component={Home} options={{headerShown: false}} />
      <nav.Screen name="DeepLink" component={DeepLink} />
    </nav.Navigator>
  );
};
