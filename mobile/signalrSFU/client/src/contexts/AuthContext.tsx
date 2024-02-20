import { createContext, useState } from 'react';

const AuthContext = createContext({
  loggedInUserName: '',
  isLoggedIn: false,

  login: (username: string) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: any }) => {
  const [loggedInUserName, setLoggedInUserName] = useState<string>('');

  const login = async (username: string): Promise<void> => {
    setLoggedInUserName(username);
  };

  const logout = (): void => {
    setLoggedInUserName('');
  };

  return (
    <AuthContext.Provider
      value={{
        loggedInUserName,
        isLoggedIn: !!loggedInUserName,

        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
