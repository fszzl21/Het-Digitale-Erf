
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

export function AdminReports() {
    const [reports, setReports] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await api.getAdminReports();
            setReports(data);
        } catch (error) {
            console.error(error);
            toast.error("Kan rapportages niet laden");
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        if (!reports) return;
        const { balans, winst_verlies } = reports;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("Financieel Rapportage", 14, 22);
        doc.setFontSize(11);
        doc.text("Het Digitale Erf", 14, 30);
        doc.text(`Datum: ${new Date().toLocaleDateString()}`, 14, 36);

        // -- Winst & Verlies --
        doc.setFontSize(14);
        doc.text("Winst & Verliesrekening", 14, 50);

        autoTable(doc, {
            startY: 55,
            head: [['Omschrijving', 'Bedrag']],
            body: [
                ['Omzet', `€ ${winst_verlies.omzet?.toFixed(2)}`],
                ['Kosten', `€ ${winst_verlies.kosten?.toFixed(2)}`],
                ['Resultaat', `€ ${winst_verlies.resultaat?.toFixed(2)}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] } // Green
        });

        // -- Balans --
        // Use (doc as any).lastAutoTable.finalY because of type definitions sometimes missing
        const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 100;
        doc.setFontSize(14);
        doc.text("Balans", 14, finalY);

        const balansRows = balans.details.map((d: string) => {
            const parts = d.split(':');
            return [parts[0], parts[1] || ''];
        });

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Rekening', 'Saldo']],
            body: [
                ...balansRows,
                ['', ''], // empty row
                ['Totaal Activa', `€ ${balans.totaal_activa?.toFixed(2)}`],
                ['Totaal Passiva', `€ ${balans.totaal_passiva?.toFixed(2)}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [60, 60, 60] }
        });

        // Save
        doc.save("financiele_rapportage.pdf");
        toast.success("PDF gedownload");
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return <div>Laden...</div>;
    if (!reports) return <div>Geen data.</div>;

    const { balans, winst_verlies } = reports;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-4">
                <button onClick={loadData} className="text-sm text-green-700 underline">Verversen</button>
                <button
                    onClick={generatePDF}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Exporteren naar PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Winst & Verlies */}
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4 border-b dark:border-border pb-2">Winst- & Verliesrekening</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-muted-foreground">Omzet</span>
                            <span className="font-medium text-green-600 dark:text-green-400">€ {winst_verlies.omzet?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-muted-foreground">Kosten</span>
                            <span className="font-medium text-red-600 dark:text-red-400">€ {winst_verlies.kosten?.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                            <span>Resultaat</span>
                            <span className={winst_verlies.resultaat >= 0 ? "text-green-700" : "text-red-700"}>
                                € {winst_verlies.resultaat?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4 border-b dark:border-border pb-2 flex justify-between">
                        <span>Balans</span>
                        <span className={`text-xs px-2 py-1 rounded ${balans.in_evenwicht ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {balans.in_evenwicht ? "In Evenwicht" : "Niet in evenwicht!"}
                        </span>
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-foreground mb-2 border-b dark:border-border">Activa</h4>
                            <ul className="text-sm space-y-1 text-gray-600 dark:text-muted-foreground">
                                {balans.details
                                    .filter((d: string) => !d.includes("Eigen Vermogen") && !d.includes("Crediteuren") && !d.includes("Schulden") && !d.includes("Resultaat") && !d.includes("Winst"))
                                }
                            </ul>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground italic mt-2">Details:</div>
                            <ul className="text-sm space-y-1 text-gray-600 dark:text-muted-foreground">
                                {balans.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                            </ul>
                        </div>
                        <div className="text-right">
                            <div className="mb-4">
                                <span className="block text-gray-500 dark:text-muted-foreground text-xs">Totaal Activa</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-foreground">€ {balans.totaal_activa?.toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 dark:text-muted-foreground text-xs">Totaal Passiva</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-foreground">€ {balans.totaal_passiva?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
