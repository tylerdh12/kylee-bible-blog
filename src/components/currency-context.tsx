'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
} from 'react';
import {
	getUserCurrency,
	getCurrencyConfig,
	type CurrencyConfig,
} from '@/lib/utils/currency';

interface CurrencyContextType {
	currency: string;
	currencyConfig: CurrencyConfig;
	setCurrency: (currency: string) => void;
	isLoading: boolean;
}

const CurrencyContext = createContext<
	CurrencyContextType | undefined
>(undefined);

interface CurrencyProviderProps {
	children: React.ReactNode;
	initialCurrency?: string;
}

export function CurrencyProvider({
	children,
	initialCurrency,
}: CurrencyProviderProps) {
	const [currency, setCurrencyState] = useState<string>(
		initialCurrency || 'USD'
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!initialCurrency) {
			const detectedCurrency = getUserCurrency();
			setCurrencyState(detectedCurrency);
		}
		setIsLoading(false);
	}, [initialCurrency]);

	const currencyConfig = getCurrencyConfig(currency);

	const setCurrency = (newCurrency: string) => {
		setCurrencyState(newCurrency);
		// Store preference in localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem(
				'preferred-currency',
				newCurrency
			);
		}
	};

	// Load saved preference on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem(
				'preferred-currency'
			);
			if (saved && !initialCurrency) {
				setCurrencyState(saved);
			}
		}
	}, [initialCurrency]);

	return (
		<CurrencyContext.Provider
			value={{
				currency,
				currencyConfig,
				setCurrency,
				isLoading,
			}}
		>
			{children}
		</CurrencyContext.Provider>
	);
}

export function useCurrencyContext() {
	const context = useContext(CurrencyContext);
	if (context === undefined) {
		throw new Error(
			'useCurrencyContext must be used within a CurrencyProvider'
		);
	}
	return context;
}
