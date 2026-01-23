import { useState, useEffect } from 'react';

export interface TokenData {
    symbol: string;
    name: string;
    priceNative: string;
    priceUsd: string;
    fdv: number;
    marketCap: number;
    pairAddress: string;
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
}

const DEFAULT_TOKENS = [
    'So11111111111111111111111111111111111111112', // SOL
    'JUPyiwrYJFv1mRiq4qp6fk6Cqn7o1dB79q75f8CQBg7', // JUP
    'DezXAZ8z7Pnrn9nuqGJa4aaFwvWdXd8z7CcxSo23x1', // BONK
    '61VneBndYfS662g8mghX6HnQ8k8eC5A2rU9fA47mBp17', // PENGU
];

export function useMarketData(tokenAddresses: string[] = DEFAULT_TOKENS) {
    const [data, setData] = useState<TokenData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses.join(',')}`);
                if (!response.ok) throw new Error('Failed to fetch market data');
                const json = await response.json();

                // Filter and map to our interface
                const mappedData: TokenData[] = (json.pairs || [])
                    .filter((pair: any) => pair.chainId === 'solana') // Only SOL for now
                    .map((pair: any) => ({
                        symbol: pair.baseToken.symbol,
                        name: pair.baseToken.name,
                        priceNative: pair.priceNative,
                        priceUsd: pair.priceUsd,
                        fdv: pair.fdv,
                        marketCap: pair.marketCap,
                        pairAddress: pair.pairAddress,
                        priceChange: pair.priceChange,
                    }))
                    // Keep only one pair per symbol for the ticker
                    .reduce((acc: TokenData[], curr: TokenData) => {
                        if (!acc.find(item => item.symbol === curr.symbol)) {
                            acc.push(curr);
                        }
                        return acc;
                    }, []);

                setData(mappedData);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        }

        fetchData();
        const interval = setInterval(fetchData, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, [tokenAddresses]);

    return { data, loading, error };
}
