import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';

import AuthContext from '../contexts/AuthContext';
import LoggedInScreen from '../pages/LoggedInScreen';
import LoginScreen from '../pages/LoginScreen';

const LoggedInStack = createNativeStackNavigator();
const LoginStack = createNativeStackNavigator();

const LoggedInStackNavigator = (): JSX.Element => {
  return (
    <LoggedInStack.Navigator screenOptions={{ headerShown: false }}>
      <LoggedInStack.Screen name="LoggedIn">
        {() => <LoggedInScreen />}
      </LoggedInStack.Screen>
    </LoggedInStack.Navigator>
  );
};

const LoginStackNavigator = (): JSX.Element => {
  return (
    <LoginStack.Navigator screenOptions={{ headerShown: false }}>
      <LoginStack.Screen name="Login">
        {() => <LoginScreen />}
      </LoginStack.Screen>
    </LoginStack.Navigator>
  );
};

export default function Navigator() {
  const { isLoggedIn } = useContext(AuthContext);

  return isLoggedIn ? <LoggedInStackNavigator /> : <LoginStackNavigator />;
}
