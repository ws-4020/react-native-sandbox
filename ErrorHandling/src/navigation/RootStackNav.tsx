import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {ErrorCase, ErrorInEventHandler, ErrorInReactComponent, ErrorInUseEffectSyncProcess} from '../screens';
import {ErrorInUseEffectAsyncProcess} from '../screens/ErrorInUseEffectAsyncProcess';

const nav = createStackNavigator();
export const RootStackNav: React.FC = () => {
  return (
    <nav.Navigator initialRouteName={ErrorCase.ScreenName}>
      <nav.Screen name={ErrorCase.ScreenName} component={ErrorCase.Screen} />
      <nav.Screen name={ErrorInEventHandler.ScreenName} component={ErrorInEventHandler.Screen} />
      <nav.Screen name={ErrorInUseEffectSyncProcess.ScreenName} component={ErrorInUseEffectSyncProcess.Screen} />
      <nav.Screen name={ErrorInUseEffectAsyncProcess.ScreenName} component={ErrorInUseEffectAsyncProcess.Screen} />
      <nav.Screen name={ErrorInReactComponent.ScreenName} component={ErrorInReactComponent.Screen} />
    </nav.Navigator>
  );
};
