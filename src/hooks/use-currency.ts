'use client';

import { useState, useEffect, useCallback } from 'react';
import {
	getUserCurrency,
	formatCurrency,
	convertCurrency,
	getCurrencyConfig,
	type CurrencyConfig,
} from '@/lib/utils/currency';

interface UseCurrencyOptions {
	initialCurrency?: string;
	enableConversion?: boolean;
	exchangeRates?: Record<string, number>;
}

interface UseCurrencyReturn {
	currency: string;
	currencyConfig: CurrencyConfig;
	setCurrency: (currency: string) => void;
	formatAmount: (
		amount: number,
		options?: Parameters<typeof formatCurrency>[2]
	) => string;
	convertAmount: (amountUSD: number) => number;
	isLoading: boolean;
}

/**
 * Hook for managing currency localization
 */
export function useCurrency(
	options: UseCurrencyOptions = {}
): UseCurrencyReturn {
	const {
		initialCurrency,
		enableConversion = false,
		exchangeRates,
	} = options;

	const [currency, setCurrencyState] = useState<string>(
		initialCurrency || 'USD'
	);
	const [isLoading, setIsLoading] = useState(true);

	// Initialize currency on mount
	useEffect(() => {
		if (!initialCurrency) {
			const detectedCurrency = getUserCurrency();
			setCurrencyState(detectedCurrency);
		}
		setIsLoading(false);
	}, [initialCurrency]);

	const currencyConfig = getCurrencyConfig(currency);

	const setCurrency = useCallback((newCurrency: string) => {
		setCurrencyState(newCurrency);
	}, []);

	const formatAmount = useCallback(
		(
			amount: number,
			formatOptions?: Parameters<typeof formatCurrency>[2]
		) => {
			return formatCurrency(
				amount,
				currency,
				formatOptions
			);
		},
		[currency]
	);

	const convertAmount = useCallback(
		(amountUSD: number) => {
			if (!enableConversion || currency === 'USD') {
				return amountUSD;
			}
			return convertCurrency(
				amountUSD,
				currency,
				exchangeRates
			);
		},
		[currency, enableConversion, exchangeRates]
	);

	return {
		currency,
		currencyConfig,
		setCurrency,
		formatAmount,
		convertAmount,
		isLoading,
	};
}

/**
 * Hook for currency selection in forms
 */
export function useCurrencySelector() {
	const {
		currency,
		setCurrency,
		currencyConfig,
		isLoading,
	} = useCurrency();

	return {
		selectedCurrency: currency,
		currencyConfig,
		setSelectedCurrency: setCurrency,
		isLoading,
	};
}
