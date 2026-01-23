export interface MobulaTokenData {
    name: string;
    symbol: string;
    price: number;
    market_cap: number;
    liquidity: number;
    logo?: string;
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
