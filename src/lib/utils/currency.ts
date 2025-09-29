/**
 * Currency localization utilities
 * Supports international currency formatting and conversion
 */

export interface CurrencyConfig {
	code: string;
	symbol: string;
	name: string;
	locale: string;
	exchangeRate?: number; // Exchange rate from USD
}

// Common currencies with their configurations
export const CURRENCIES: Record<string, CurrencyConfig> = {
	USD: {
		code: 'USD',
		symbol: '$',
		name: 'US Dollar',
		locale: 'en-US',
	},
	EUR: {
		code: 'EUR',
		symbol: '€',
		name: 'Euro',
		locale: 'de-DE',
	},
	GBP: {
		code: 'GBP',
		symbol: '£',
		name: 'British Pound',
		locale: 'en-GB',
	},
	CAD: {
		code: 'CAD',
		symbol: 'C$',
		name: 'Canadian Dollar',
		locale: 'en-CA',
	},
	AUD: {
		code: 'AUD',
		symbol: 'A$',
		name: 'Australian Dollar',
		locale: 'en-AU',
	},
	JPY: {
		code: 'JPY',
		symbol: '¥',
		name: 'Japanese Yen',
		locale: 'ja-JP',
	},
	CNY: {
		code: 'CNY',
		symbol: '¥',
		name: 'Chinese Yuan',
		locale: 'zh-CN',
	},
	INR: {
		code: 'INR',
		symbol: '₹',
		name: 'Indian Rupee',
		locale: 'en-IN',
	},
	BRL: {
		code: 'BRL',
		symbol: 'R$',
		name: 'Brazilian Real',
		locale: 'pt-BR',
	},
	MXN: {
		code: 'MXN',
		symbol: '$',
		name: 'Mexican Peso',
		locale: 'es-MX',
	},
	KRW: {
		code: 'KRW',
		symbol: '₩',
		name: 'South Korean Won',
		locale: 'ko-KR',
	},
	RUB: {
		code: 'RUB',
		symbol: '₽',
		name: 'Russian Ruble',
		locale: 'ru-RU',
	},
	ZAR: {
		code: 'ZAR',
		symbol: 'R',
		name: 'South African Rand',
		locale: 'en-ZA',
	},
	SEK: {
		code: 'SEK',
		symbol: 'kr',
		name: 'Swedish Krona',
		locale: 'sv-SE',
	},
	NOK: {
		code: 'NOK',
		symbol: 'kr',
		name: 'Norwegian Krone',
		locale: 'nb-NO',
	},
	DKK: {
		code: 'DKK',
		symbol: 'kr',
		name: 'Danish Krone',
		locale: 'da-DK',
	},
	CHF: {
		code: 'CHF',
		symbol: 'CHF',
		name: 'Swiss Franc',
		locale: 'de-CH',
	},
	PLN: {
		code: 'PLN',
		symbol: 'zł',
		name: 'Polish Zloty',
		locale: 'pl-PL',
	},
	CZK: {
		code: 'CZK',
		symbol: 'Kč',
		name: 'Czech Koruna',
		locale: 'cs-CZ',
	},
	HUF: {
		code: 'HUF',
		symbol: 'Ft',
		name: 'Hungarian Forint',
		locale: 'hu-HU',
	},
	TRY: {
		code: 'TRY',
		symbol: '₺',
		name: 'Turkish Lira',
		locale: 'tr-TR',
	},
	ILS: {
		code: 'ILS',
		symbol: '₪',
		name: 'Israeli Shekel',
		locale: 'he-IL',
	},
	AED: {
		code: 'AED',
		symbol: 'د.إ',
		name: 'UAE Dirham',
		locale: 'ar-AE',
	},
	SAR: {
		code: 'SAR',
		symbol: 'ر.س',
		name: 'Saudi Riyal',
		locale: 'ar-SA',
	},
	THB: {
		code: 'THB',
		symbol: '฿',
		name: 'Thai Baht',
		locale: 'th-TH',
	},
	SGD: {
		code: 'SGD',
		symbol: 'S$',
		name: 'Singapore Dollar',
		locale: 'en-SG',
	},
	HKD: {
		code: 'HKD',
		symbol: 'HK$',
		name: 'Hong Kong Dollar',
		locale: 'en-HK',
	},
	NZD: {
		code: 'NZD',
		symbol: 'NZ$',
		name: 'New Zealand Dollar',
		locale: 'en-NZ',
	},
};

// Default currency (USD)
export const DEFAULT_CURRENCY = 'USD';

/**
 * Get user's preferred currency based on browser locale
 */
export function getUserCurrency(): string {
	if (typeof window === 'undefined')
		return DEFAULT_CURRENCY;

	try {
		// Try to detect currency from browser locale
		const locale =
			navigator.language ||
			navigator.languages?.[0] ||
			'en-US';

		// Map common locales to currencies
		const localeToCurrency: Record<string, string> = {
			'en-US': 'USD',
			'en-CA': 'CAD',
			'en-GB': 'GBP',
			'en-AU': 'AUD',
			'en-NZ': 'NZD',
			'en-SG': 'SGD',
			'en-HK': 'HKD',
			'en-IN': 'INR',
			'en-ZA': 'ZAR',
			'de-DE': 'EUR',
			'de-CH': 'CHF',
			'fr-FR': 'EUR',
			'fr-CA': 'CAD',
			'es-ES': 'EUR',
			'es-MX': 'MXN',
			'pt-BR': 'BRL',
			'pt-PT': 'EUR',
			'it-IT': 'EUR',
			'nl-NL': 'EUR',
			'sv-SE': 'SEK',
			'nb-NO': 'NOK',
			'da-DK': 'DKK',
			'fi-FI': 'EUR',
			'pl-PL': 'PLN',
			'cs-CZ': 'CZK',
			'hu-HU': 'HUF',
			'ru-RU': 'RUB',
			'tr-TR': 'TRY',
			'ja-JP': 'JPY',
			'ko-KR': 'KRW',
			'zh-CN': 'CNY',
			'zh-TW': 'TWD',
			'th-TH': 'THB',
			'he-IL': 'ILS',
			'ar-SA': 'SAR',
			'ar-AE': 'AED',
		};

		// Check for exact locale match
		if (localeToCurrency[locale]) {
			return localeToCurrency[locale];
		}

		// Check for language code match (e.g., 'en' from 'en-US')
		const languageCode = locale.split('-')[0];
		const languageToCurrency: Record<string, string> = {
			en: 'USD',
			de: 'EUR',
			fr: 'EUR',
			es: 'EUR',
			pt: 'BRL',
			it: 'EUR',
			nl: 'EUR',
			sv: 'SEK',
			no: 'NOK',
			da: 'DKK',
			fi: 'EUR',
			pl: 'PLN',
			cs: 'CZK',
			hu: 'HUF',
			ru: 'RUB',
			tr: 'TRY',
			ja: 'JPY',
			ko: 'KRW',
			zh: 'CNY',
			th: 'THB',
			he: 'ILS',
			ar: 'SAR',
		};

		if (languageToCurrency[languageCode]) {
			return languageToCurrency[languageCode];
		}

		return DEFAULT_CURRENCY;
	} catch {
		return DEFAULT_CURRENCY;
	}
}

/**
 * Format currency amount with proper localization
 */
export function formatCurrency(
	amount: number,
	currencyCode: string = DEFAULT_CURRENCY,
	options: {
		showSymbol?: boolean;
		showCode?: boolean;
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
	} = {}
): string {
	const {
		showSymbol = true,
		showCode = false,
		minimumFractionDigits,
		maximumFractionDigits,
	} = options;

	const currency =
		CURRENCIES[currencyCode] ||
		CURRENCIES[DEFAULT_CURRENCY];

	try {
		// Use Intl.NumberFormat for proper localization
		const formatter = new Intl.NumberFormat(
			currency.locale,
			{
				style: 'currency',
				currency: currencyCode,
				minimumFractionDigits:
					minimumFractionDigits ??
					(currencyCode === 'JPY' ? 0 : 2),
				maximumFractionDigits:
					maximumFractionDigits ??
					(currencyCode === 'JPY' ? 0 : 2),
			}
		);

		let formatted = formatter.format(amount);

		// Customize display based on options
		if (!showSymbol && !showCode) {
			// Remove currency symbol and code, keep only the number
			formatted = formatted
				.replace(/[^\d.,\s-]/g, '')
				.trim();
		} else if (showCode && !showSymbol) {
			// Replace symbol with currency code
			formatted = formatted.replace(
				currency.symbol,
				currencyCode
			);
		}

		return formatted;
	} catch (error) {
		// Fallback to simple formatting
		console.warn(
			`Currency formatting failed for ${currencyCode}:`,
			error
		);
		const symbol = showSymbol ? currency.symbol : '';
		const code = showCode ? ` ${currencyCode}` : '';
		const decimals = currencyCode === 'JPY' ? 0 : 2;
		return `${symbol}${amount.toFixed(decimals)}${code}`;
	}
}

/**
 * Convert amount from USD to target currency
 * Note: This is a placeholder - in production, you'd want to use a real exchange rate API
 */
export function convertCurrency(
	amountUSD: number,
	targetCurrency: string,
	exchangeRates?: Record<string, number>
): number {
	if (targetCurrency === 'USD') return amountUSD;

	// Use provided exchange rates or fallback to approximate rates
	const rates = exchangeRates || {
		EUR: 0.85,
		GBP: 0.73,
		CAD: 1.35,
		AUD: 1.5,
		JPY: 110.0,
		CNY: 6.45,
		INR: 75.0,
		BRL: 5.2,
		MXN: 20.0,
		KRW: 1200.0,
		RUB: 75.0,
		ZAR: 15.0,
		SEK: 8.5,
		NOK: 8.8,
		DKK: 6.3,
		CHF: 0.92,
		PLN: 3.9,
		CZK: 21.5,
		HUF: 300.0,
		TRY: 8.5,
		ILS: 3.2,
		AED: 3.67,
		SAR: 3.75,
		THB: 33.0,
		SGD: 1.35,
		HKD: 7.8,
		NZD: 1.45,
	};

	const rate = rates[targetCurrency] || 1;
	return amountUSD * rate;
}

/**
 * Get currency configuration
 */
export function getCurrencyConfig(
	currencyCode: string
): CurrencyConfig {
	return (
		CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY]
	);
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
	return Object.values(CURRENCIES);
}

/**
 * Format currency for display in forms (without symbol)
 */
export function formatCurrencyForInput(
	amount: number,
	currencyCode: string = DEFAULT_CURRENCY
): string {
	const currency =
		CURRENCIES[currencyCode] ||
		CURRENCIES[DEFAULT_CURRENCY];
	const decimals = currencyCode === 'JPY' ? 0 : 2;
	return amount.toFixed(decimals);
}

/**
 * Parse currency input to number
 */
export function parseCurrencyInput(
	input: string,
	currencyCode: string = DEFAULT_CURRENCY
): number {
	// Remove currency symbols and spaces
	const cleaned = input.replace(/[^\d.,-]/g, '');

	// Handle different decimal separators
	const currency =
		CURRENCIES[currencyCode] ||
		CURRENCIES[DEFAULT_CURRENCY];
	const locale = currency.locale;

	// Try to parse based on locale
	try {
		const formatter = new Intl.NumberFormat(locale);
		const parts = formatter.formatToParts(1234.56);
		const decimalSeparator =
			parts.find((part) => part.type === 'decimal')
				?.value || '.';
		const groupSeparator =
			parts.find((part) => part.type === 'group')?.value ||
			',';

		let normalized = cleaned;
		if (
			decimalSeparator === ',' &&
			groupSeparator === '.'
		) {
			// European format: 1.234,56
			normalized = cleaned
				.replace(/\./g, '')
				.replace(',', '.');
		} else {
			// US format: 1,234.56
			normalized = cleaned.replace(/,/g, '');
		}

		return parseFloat(normalized) || 0;
	} catch {
		// Fallback to simple parsing
		return parseFloat(cleaned.replace(/,/g, '')) || 0;
	}
}
