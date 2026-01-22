
import { MemeBot } from "@/components/MemeBot";

export default function TradingPage() {
    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Meme Coin Bot</h1>
                <p className="text-muted-foreground">Real-time automation and monitoring</p>
            </div>
            <MemeBot />
        </div>
    );
}
