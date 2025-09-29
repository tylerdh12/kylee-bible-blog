'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import { getAvailableCurrencies } from '@/lib/utils/currency';
import { useState, useEffect } from 'react';

interface CurrencySelectorProps {
	value?: string;
	onValueChange?: (currency: string) => void;
	className?: string;
	showSymbol?: boolean;
	showName?: boolean;
}

export function CurrencySelector({
	value,
	onValueChange,
	className,
	showSymbol = true,
	showName = true,
}: CurrencySelectorProps) {
	const { currency, setCurrency } = useCurrency();
	const [availableCurrencies, setAvailableCurrencies] =
		useState(getAvailableCurrencies());

	const selectedCurrency = value || currency;

	const handleValueChange = (newCurrency: string) => {
		if (onValueChange) {
			onValueChange(newCurrency);
		} else {
			setCurrency(newCurrency);
		}
	};

	const formatCurrencyOption = (currency: any) => {
		const parts = [];

		if (showSymbol) {
			parts.push(currency.symbol);
		}

		if (showName) {
			parts.push(currency.name);
		}

		parts.push(`(${currency.code})`);

		return parts.join(' ');
	};

	return (
		<Select
			value={selectedCurrency}
			onValueChange={handleValueChange}
		>
			<SelectTrigger className={className}>
				<SelectValue placeholder='Select currency' />
			</SelectTrigger>
			<SelectContent>
				{availableCurrencies.map((currency) => (
					<SelectItem
						key={currency.code}
						value={currency.code}
					>
						{formatCurrencyOption(currency)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
