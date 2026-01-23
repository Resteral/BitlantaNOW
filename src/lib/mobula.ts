export interface MobulaTokenData {
    name: string;
    symbol: string;
    price: number;
    market_cap: number;
    liquidity: number;
    logo?: string;
    address?: string;
}

const MOBULA_API_BASE = 'https://api.mobula.io/api/1';

export async function getTokenMetadata(address: string, blockchain: string = 'solana'): Promise<MobulaTokenData | null> {
    try {
        const response = await fetch(`${MOBULA_API_BASE}/market/data?asset=${address}&blockchain=${blockchain}`);
        if (!response.ok) return null;

        const { data } = await response.json();
        if (!data) return null;

        return {
            name: data.name,
            symbol: data.symbol,
            price: data.price || 0,
            market_cap: data.market_cap || 0,
            liquidity: data.liquidity || 0,
            logo: data.logo
        };
    } catch (error) {
        console.error('Mobula API Error:', error);
        return null;
    }
}

export async function getSolPrice(): Promise<number> {
    try {
        const response = await fetch(`${MOBULA_API_BASE}/market/data?asset=solana`);
        if (!response.ok) return 245.82; // Fallback

        const { data } = await response.json();
        return data?.price || 245.82;
    } catch {
        return 245.82;
    }
}
export async function getMultiTokenPrices(addresses: string[]): Promise<Record<string, number>> {
    if (addresses.length === 0) return {};
    try {
        // Mobula multi-data endpoint: market/multi-data?assets=address1,address2
        const response = await fetch(`${MOBULA_API_BASE}/market/multi-data?assets=${addresses.join(',')}`);
        if (!response.ok) return {};

        const { data } = await response.json();
        const prices: Record<string, number> = {};

        // Map response data to address -> price
        Object.keys(data).forEach(addr => {
            prices[addr] = data[addr].price || 0;
        });

        return prices;
    } catch (error) {
        console.error('Mobula Multi-Price Error:', error);
        return {};
    }
}

export async function getTrendingTokens(): Promise<MobulaTokenData[]> {
    try {
        // Fetch trending - using a query to get recently listed or hot tokens
        // Fallback to a query for Solana tokens sorted by creation if trending specific endpoint isn't documented/verified,
        // but 'market/trends' is a common pattern. Let's try to query with a volume filter.
        // Mobula often uses /market/query
        const response = await fetch(`${MOBULA_API_BASE}/market/query?blockchain=solana&limit=10&sortBy=createdAt&sortOrder=desc`);

        if (!response.ok) return [];

        const { data } = await response.json();

        if (!data || !Array.isArray(data)) return [];

        return data.map((token: any) => ({
            name: token.name,
            symbol: token.symbol,
            price: token.price || 0,
            market_cap: token.market_cap || 0,
            liquidity: token.liquidity || 0,
            logo: token.logo,
            address: token.address
        }));
    } catch (error) {
        console.error('Mobula Trending Error:', error);
        return [];
    }
}
