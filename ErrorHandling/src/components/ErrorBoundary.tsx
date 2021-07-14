import React from 'react';
import {View, Text} from 'react-native';

type State = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<React.PropsWithChildren<any>, State> {
  constructor(props: React.PropsWithChildren<any>) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log('Did catch error In Error Boundary.');
  }

  render() {
    // TODO useEffectなどで実施している同期処理でエラーになった場合もError Boundaryで捕捉できてしまうので、React Componentの再構築で良いのか要検討
    if (this.state.hasError) {
      return (
        <View>
          <Text>Error Boundary</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export {ErrorBoundary};
