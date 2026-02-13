import { useCallback } from 'react';
import { useCurrencyContext } from '../contexts/CurrencyContext';

export function useCurrency() {
    const { currency, setCurrency, rate } = useCurrencyContext();

    const formatPrice = useCallback((amountInUsd: number) => {
        const converted = amountInUsd * rate;

        return new Intl.NumberFormat(currency === 'PHP' ? 'en-PH' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(converted);
    }, [currency, rate]);

    const toPhp = useCallback((amountInUsd: number) => {
        // Keeps name toPhp for compatibility, but really converts to current currency value
        return amountInUsd * rate;
    }, [rate]);

    return { formatPrice, currency, setCurrency, rate, toPhp };
}
