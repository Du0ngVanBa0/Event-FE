import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/UserTypes';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('jwt');
            if (token) {
                try {
                    const userStr = localStorage.getItem('user_data');
                    if (userStr) {
                        const userData = JSON.parse(userStr);
                        setUser(userData);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('jwt');
                    localStorage.removeItem('user_data');
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('jwt', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user_data');
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
