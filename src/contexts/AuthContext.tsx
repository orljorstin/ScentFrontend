import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, auth as authHelpers } from '../api';

interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
}

interface PendingAction {
    type: 'addToCart' | 'toggleFavorite';
    productId: number;
    size?: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    pendingAction: PendingAction | null;
    returnPath: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
    logout: () => void;
    setPendingAction: (action: PendingAction | null) => void;
    setReturnPath: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [returnPath, setReturnPath] = useState<string | null>(null);

    useEffect(() => {
        const token = authHelpers.getToken();
        if (token) {
            api.get('/api/user/me')
                .then(u => setUser(u))
                .catch(() => { authHelpers.logout(); })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const { user: u, token } = await authHelpers.login({ email, password });
        authHelpers.saveToken(token);
        setUser(u);
    };

    const register = async (email: string, password: string, name: string, phone?: string) => {
        const { user: u, token } = await authHelpers.register({ email, password, name, phone });
        authHelpers.saveToken(token);
        setUser(u);
    };

    const logout = () => {
        authHelpers.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            pendingAction,
            returnPath,
            login,
            register,
            logout,
            setPendingAction,
            setReturnPath,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
