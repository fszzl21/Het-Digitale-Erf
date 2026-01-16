
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface ReportsData {
    balans: {
        totaal_activa: number;
        totaal_passiva: number;
        in_evenwicht: boolean;
        details: string[];
    };
    winst_verlies: {
        omzet: number;
        kosten: number;
        resultaat: number;
    };
}

export function FinanceWidget() {
    const [stats, setStats] = useState<ReportsData | null>(null);

    useEffect(() => {
        api.getAdminReports().then(setStats).catch(console.error);
    }, []);

    if (!stats) return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full min-h-[200px] animate-pulse"></div>;

    const { winst_verlies, balans } = stats;

    return (
        <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border h-full transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    Financieel
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Resultaat Card */}
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="text-xs font-medium text-green-800 dark:text-green-400 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Resultaat
                    </div>
                    <div className={`text-xl font-bold ${winst_verlies.resultaat >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        € {winst_verlies.resultaat?.toFixed(0)}
                    </div>
                </div>

                {/* Balans Card */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Balans
                    </div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        € {balans.totaal_activa?.toFixed(0)}
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-muted-foreground">Omzet</span>
                    <span className="font-medium text-gray-900 dark:text-foreground">€ {winst_verlies.omzet?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-muted-foreground">Kosten</span>
                    <span className="font-medium text-gray-900 dark:text-foreground">€ {winst_verlies.kosten?.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
