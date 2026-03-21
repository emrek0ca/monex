export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface ExchangeRates {
    [key: string]: number;
}

export class CurrencyService {
    private static rates: ExchangeRates = {
        'USD': 1,
        'TRY': 33.5,
        'EUR': 0.92,
        'GBP': 0.78,
    };

    /**
     * Converts an amount from one currency to another
     */
    static convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
        if (from === to) return amount;
        
        // Convert to USD first (as base)
        const inUSD = from === 'USD' ? amount : amount / (this.rates[from] || 1);
        
        // Convert from USD to target
        return to === 'USD' ? inUSD : inUSD * (this.rates[to] || 1);
    }

    /**
     * Get currency symbol
     */
    static getSymbol(code: string): string {
        switch (code) {
            case 'TRY': return '₺';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'USD': return '$';
            default: return '$';
        }
    }

    /**
     * Map symbol to code
     */
    static getCodeFromSymbol(symbol: string): CurrencyCode {
        switch (symbol) {
            case '₺': return 'TRY';
            case '€': return 'EUR';
            case '£': return 'GBP';
            case '$': return 'USD';
            default: return 'USD';
        }
    }

    /**
     * Fetch latest rates from an API (Placeholder for future integration)
     */
    static async fetchLatestRates(): Promise<void> {
        try {
            // In a production app, you would call a real API here:
            // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            // const data = await response.json();
            // this.rates = data.rates;
            console.log('Currency rates synced');
        } catch (error) {
            console.error('Failed to fetch currency rates:', error);
        }
    }
}
