
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function AdminFinance() {
    const [ledger, setLedger] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [ledgerData, bookingData] = await Promise.all([
                api.getAdminLedger(),
                api.getAdminBookings()
            ]);
            setLedger(ledgerData);
            setBookings(bookingData);
        } catch (error) {
            console.error(error);
            toast.error("Kan Financiële data niet laden");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // New Booking Form (Simplified)
    const [newBooking, setNewBooking] = useState({
        id: '', date: new Date().toISOString().split('T')[0], period: 202501, journal_type: 'MEM',
        description: '', amount: 0, debit_account: '', credit_account: ''
    });

    const handleAddBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert simple form to complex Booking Lines structure
        const bookingPayload = {
            id: newBooking.id,
            date: newBooking.date,
            period: Number(newBooking.period),
            journal_type: newBooking.journal_type,
            lines: [
                {
                    account_code: newBooking.debit_account,
                    description: newBooking.description,
                    debit: newBooking.amount,
                    credit: 0
                },
                {
                    account_code: newBooking.credit_account,
                    description: newBooking.description,
                    debit: 0,
                    credit: newBooking.amount
                }
            ]
        };

        try {
            await api.addAdminBooking(bookingPayload);
            toast.success("Boeking aangemaakt");
            setNewBooking({ ...newBooking, id: '', description: '', amount: 0 });
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Fout bij aanmaken boeking");
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <div className="space-y-8">
            {/* Grootboek Schema */}
            <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Grootboekrekeningschema</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ledger.map(acc => (
                        <div key={acc.code} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-foreground">{acc.code}</span>
                            <span className="text-sm text-gray-600 dark:text-muted-foreground">{acc.name}</span>
                            <span className="text-xs text-gray-400 dark:text-muted-foreground/70 mt-1">{acc.type}</span>
                            <span className={`text-sm font-mono mt-2 ${acc.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                € {Math.abs(acc.balance || 0).toFixed(2)} {acc.balance < 0 ? 'C' : 'D'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Nieuwe Booking Formulier */}
                <div className="lg:col-span-1 bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Nieuwe Boeking</h3>
                    <form onSubmit={handleAddBooking} className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-muted-foreground">Boekstuk Nr.</label>
                            <input className="w-full border dark:border-input rounded p-2 text-sm bg-transparent dark:text-foreground dark:bg-background" value={newBooking.id} onChange={e => setNewBooking({ ...newBooking, id: e.target.value })} required placeholder="2025-XXX" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-muted-foreground">Datum</label>
                            <input type="date" className="w-full border dark:border-input rounded p-2 text-sm bg-transparent dark:text-foreground dark:bg-background" value={newBooking.date} onChange={e => setNewBooking({ ...newBooking, date: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-muted-foreground">Omschrijving</label>
                            <input className="w-full border dark:border-input rounded p-2 text-sm bg-transparent dark:text-foreground dark:bg-background" value={newBooking.description} onChange={e => setNewBooking({ ...newBooking, description: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-muted-foreground">Bedrag</label>
                            <input type="number" step="0.01" className="w-full border dark:border-input rounded p-2 text-sm bg-transparent dark:text-foreground dark:bg-background" value={newBooking.amount} onChange={e => setNewBooking({ ...newBooking, amount: parseFloat(e.target.value) })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-muted-foreground">Debet Rek.</label>
                                <select className="w-full border dark:border-input rounded p-2 text-sm bg-transparent dark:text-foreground dark:bg-background" value={newBooking.debit_account} onChange={e => setNewBooking({ ...newBooking, debit_account: e.target.value })} required>
                                    <option value="">Kies...</option>
                                    {ledger.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-muted-foreground">Credit Rek.</label>
                                <select className="w-full border dark:border-input rounded p-2 text-sm bg-transparent dark:text-foreground dark:bg-background" value={newBooking.credit_account} onChange={e => setNewBooking({ ...newBooking, credit_account: e.target.value })} required>
                                    <option value="">Kies...</option>
                                    {ledger.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mt-2">
                            Boek
                        </button>
                    </form>
                </div>

                {/* Boekingen Lijst */}
                <div className="lg:col-span-2 bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Journaal</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-muted-foreground border-b dark:border-border">
                                    <th className="pb-2">Boekstuk</th>
                                    <th className="pb-2">Datum</th>
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2 text-right">Totaal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-border">
                                {bookings.map(b => (
                                    <tr key={b.id} className="group hover:bg-gray-50 dark:hover:bg-muted/50">
                                        <td className="py-2 font-medium text-gray-900 dark:text-foreground">{b.id}</td>
                                        <td className="py-2 text-gray-600 dark:text-muted-foreground">{b.date}</td>
                                        <td className="py-2"><span className="px-2 py-1 bg-gray-100 dark:bg-muted rounded text-xs dark:text-muted-foreground">{b.journal_type}</span></td>
                                        <td className="py-2 text-right font-mono text-gray-900 dark:text-foreground">
                                            € {b.lines.reduce((s: number, l: any) => s + l.debit, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
