'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { CurrencySelector } from './currency-selector';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/utils/currency';

export function CurrencySettings() {
	const { currency, setCurrency, currencyConfig } =
		useCurrency();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Currency Settings</CardTitle>
				<CardDescription>
					Choose your preferred currency for viewing
					donations and goals
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-2'>
					<label className='text-sm font-medium'>
						Preferred Currency
					</label>
					<CurrencySelector
						value={currency}
						onValueChange={setCurrency}
						showSymbol={true}
						showName={true}
					/>
				</div>

				<div className='text-sm text-muted-foreground'>
					<p>
						Current currency: {currencyConfig.name} (
						{currencyConfig.code})
					</p>
					<p>Example: {formatCurrency(100, currency)}</p>
				</div>
			</CardContent>
		</Card>
	);
}
