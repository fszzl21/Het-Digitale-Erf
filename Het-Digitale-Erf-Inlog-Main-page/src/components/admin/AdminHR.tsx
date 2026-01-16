
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Plus, Check } from 'lucide-react';

export function AdminHR() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [empData, reqData] = await Promise.all([
                api.getAdminEmployees(),
                api.getAdminLeaveRequests()
            ]);
            setEmployees(empData);
            setRequests(reqData);
        } catch (error) {
            console.error(error);
            toast.error("Kan HR data niet laden");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await api.approveAdminLeave(id);
            toast.success("Verlof goedgekeurd");
            loadData();
        } catch (error) {
            toast.error("Kon verlof niet goedkeuren");
        }
    };

    // New Employee Form State
    const [newEmp, setNewEmp] = useState({ id: '', name: '', role: 'Medewerker', leave_balance: 200 });

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addAdminEmployee(newEmp);
            toast.success("Medewerker toegevoegd");
            setNewEmp({ id: '', name: '', role: 'Medewerker', leave_balance: 200 });
            loadData();
        } catch (error) {
            toast.error("Fout bij toevoegen");
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Medewerkers */}
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Medewerkers</h3>

                    <form onSubmit={handleAddEmployee} className="mb-4 flex gap-2">
                        <input
                            placeholder="ID (bijv EMP01)"
                            className="border p-2 rounded w-24 bg-white dark:bg-background dark:border-input dark:text-foreground"
                            value={newEmp.id}
                            onChange={e => setNewEmp({ ...newEmp, id: e.target.value })}
                        />
                        <input
                            placeholder="Naam"
                            className="border p-2 rounded flex-1 bg-white dark:bg-background dark:border-input dark:text-foreground"
                            value={newEmp.name}
                            onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Saldo"
                            className="border p-2 rounded w-20 bg-white dark:bg-background dark:border-input dark:text-foreground"
                            value={newEmp.leave_balance}
                            onChange={e => setNewEmp({ ...newEmp, leave_balance: parseFloat(e.target.value) })}
                        />
                        <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                            <Plus className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b dark:border-border text-gray-500 dark:text-muted-foreground">
                                    <th className="pb-2">ID</th>
                                    <th className="pb-2">Naam</th>
                                    <th className="pb-2">Functie</th>
                                    <th className="pb-2">Saldo (uur)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {employees.map((e) => (
                                    <tr key={e.id} className="group hover:bg-gray-50 dark:hover:bg-muted/50">
                                        <td className="py-2 text-gray-900 dark:text-foreground font-medium">{e.id}</td>
                                        <td className="py-2 text-gray-600 dark:text-muted-foreground">{e.name}</td>
                                        <td className="py-2 text-gray-500 dark:text-muted-foreground">{e.role}</td>
                                        <td className="py-2 text-gray-900 dark:text-foreground font-bold">{e.leave_balance}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Verlof Aanvragen */}
                <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Openstaande Aanvragen</h3>
                    <div className="space-y-4">
                        {requests.filter(r => r.status === 'AANGEVRAAGD').length === 0 && (
                            <p className="text-gray-500 dark:text-muted-foreground italic">Geen openstaande aanvragen.</p>
                        )}
                        {requests.filter(r => r.status === 'AANGEVRAAGD').map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-foreground">{req.employee_name}</p>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground">{req.start_date} t/m {req.end_date} ({req.total_hours}u)</p>
                                    <p className="text-xs text-gray-500 dark:text-muted-foreground italic">{req.reason}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        className="p-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                                        title="Goedkeuren"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mt-8 mb-4">Verlof Historie</h3>
                    <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b dark:border-border text-gray-500 dark:text-muted-foreground">
                                    <th className="pb-2">Medewerker</th>
                                    <th className="pb-2">Datum</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {requests.filter(r => r.status !== 'AANGEVRAAGD').map((req) => (
                                    <tr key={req.id} className="text-gray-600 dark:text-muted-foreground">
                                        <td className="py-2">{req.employee_name}</td>
                                        <td className="py-2">{req.start_date}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${req.status === 'GOEDGEKEURD' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {req.status}
                                            </span>
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
