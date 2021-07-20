import {NavigationContainer} from '@react-navigation/native';
import {DeepLinkContextProvider} from 'context';
import {RootStackNav} from 'navigation';
import React from 'react';

export const App = () => {
  return (
    <DeepLinkContextProvider>
      <NavigationContainer>
        <RootStackNav />
      </NavigationContainer>
    </DeepLinkContextProvider>
  );
};
