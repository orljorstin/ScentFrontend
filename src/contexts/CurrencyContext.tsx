import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'USD' | 'PHP';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    rate: number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CURRENCY_RATES = {
    USD: 1,
    PHP: 56,
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('PHP');

    useEffect(() => {
        const stored = localStorage.getItem('scentsmiths_currency');
        if (stored === 'USD' || stored === 'PHP') {
            setCurrencyState(stored);
        }
    }, []);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem('scentsmiths_currency', c);
    };

    const rate = CURRENCY_RATES[currency];

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, rate }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrencyContext() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrencyContext must be used within a CurrencyProvider');
    }
    return context;
}
