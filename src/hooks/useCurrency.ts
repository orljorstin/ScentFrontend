import { useCallback } from 'react';

export const CURRENCY_RATES = {
    USD: 1,
    PHP: 56,
};

export function useCurrency() {
    // In a real app, this could be stateful or fetched
    const currency = 'PHP';
    const rate = CURRENCY_RATES.PHP;

    const formatPrice = useCallback((amountInUsd: number) => {
        const converted = amountInUsd * rate;

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(converted);
    }, [rate]);

    const toPhp = useCallback((amountInUsd: number) => {
        return amountInUsd * rate;
    }, [rate]);

    return { formatPrice, currency, rate, toPhp };
}
