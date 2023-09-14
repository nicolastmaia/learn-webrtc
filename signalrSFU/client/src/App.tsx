import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import Navigator from './components/Navigator';
import { AuthProvider } from './contexts/AuthContext';

const MainScreen = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default MainScreen;
