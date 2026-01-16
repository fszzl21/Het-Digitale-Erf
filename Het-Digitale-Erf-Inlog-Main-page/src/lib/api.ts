export const API_URL = 'http://localhost:8000/api';

export interface User {
    username: string;
    role: 'Beheerder' | 'Manager' | 'Medewerker';
    token: string;
}

export interface Reservation {
    id: number;
    guest_name: string;
    pitch_number: string;
    start_date: string;
    end_date: string;
    guest_count: number;
    status: string;
}

export interface Activity {
    id: number;
    name: string;
    description?: string;
    date: string;
    time: string;
    location: string;
    current_participants: number;
    max_participants: number;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: 'laag' | 'normaal' | 'hoog';
    status: 'todo' | 'in_progress' | 'done';
    deadline?: string;
    assigned_to?: string;
}

export interface Absence {
    id: number;
    employee: string;
    type: string;
    start_date: string;
    end_date?: string;
    reason?: string;
}

export const api = {
    // Auth
    async login(username: string, password: string): Promise<User> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        return {
            username: data.user?.username || username,
            role: data.user?.role as User['role'],
            token: data.token,
        };
    },

    // Reservations
    async getReservations(): Promise<Reservation[]> {
        const response = await fetch(`${API_URL}/reservations`);

        if (!response.ok) {
            throw new Error('Failed to fetch reservations');
        }

        return response.json();
    },

    async createReservation(reservation: Omit<Reservation, 'id'>) {
        const response = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation),
        });
        if (!response.ok) throw new Error('Failed to create reservation');
        return response.json();
    },

    // Occupancy
    async getOccupancy(token: string) {
        const response = await fetch(`${API_URL}/occupancy`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch occupancy');
        }

        return response.json();
    },

    // Activities
    async getActivities(): Promise<Activity[]> {
        try {
            const response = await fetch(`${API_URL}/activities`);
            if (!response.ok) throw new Error('Failed to fetch activities');
            return await response.json();
        } catch (error) {
            console.error('Get activities error:', error);
            throw error;
        }
    },

    async createActivity(activity: Omit<Activity, 'id'>) {
        try {
            const response = await fetch(`${API_URL}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activity),
            });
            if (!response.ok) throw new Error('Failed to create activity');
            return await response.json();
        } catch (error) {
            console.error('Create activity error:', error);
            throw error;
        }
    },

    async updateActivity(id: number, activity: Partial<Activity>) {
        try {
            const response = await fetch(`${API_URL}/activities/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activity),
            });
            if (!response.ok) throw new Error('Failed to update activity');
            return await response.json();
        } catch (error) {
            console.error('Update activity error:', error);
            throw error;
        }
    },

    async deleteActivity(id: number) {
        try {
            const response = await fetch(`${API_URL}/activities/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete activity');
            return await response.json();
        } catch (error) {
            console.error('Delete activity error:', error);
            throw error;
        }
    },

    // Tasks
    async getTasks(): Promise<Task[]> {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    },

    async createTask(task: Omit<Task, 'id'>) {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
    },

    async updateTask(id: number, task: Partial<Task>) {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    },

    async deleteTask(id: number) {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
        return response.json();
    },

    // Absences (Sick Leave)
    async getAbsences(): Promise<Absence[]> {
        const response = await fetch(`${API_URL}/absences`);
        if (!response.ok) throw new Error('Failed to fetch absences');
        return response.json();
    },

    async createAbsence(absence: Omit<Absence, 'id'>) {
        const response = await fetch(`${API_URL}/absences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(absence),
        });
        if (!response.ok) throw new Error('Failed to create absence');
        return response.json();
    },

    async updateAbsence(id: number, absence: Partial<Absence>) {
        const response = await fetch(`${API_URL}/absences/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(absence),
        });
        if (!response.ok) throw new Error('Failed to update absence');
        return response.json();
    },

    async deleteAbsence(id: number) {
        const response = await fetch(`${API_URL}/absences/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete absence');
        return response.json();
    },

    // --- Administration Module ---

    // HR
    async getAdminEmployees() {
        const response = await fetch(`${API_URL}/admin/employees`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        return response.json();
    },

    async addAdminEmployee(employee: { id: string; name: string; role: string; leave_balance: number }) {
        const response = await fetch(`${API_URL}/admin/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee),
        });
        if (!response.ok) throw new Error('Failed to add employee');
        return response.json();
    },

    async getAdminLeaveRequests() {
        const response = await fetch(`${API_URL}/admin/leave`);
        if (!response.ok) throw new Error('Failed to fetch leave requests');
        return response.json();
    },

    async requestAdminLeave(request: { id: string; employee_id: string; start_date: string; end_date: string; total_hours: number; reason: string }) {
        const response = await fetch(`${API_URL}/admin/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to request leave');
        }
        return response.json();
    },

    async approveAdminLeave(id: string) {
        const response = await fetch(`${API_URL}/admin/leave/${id}/approve`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to approve leave');
        return response.json();
    },

    // Finance
    async getAdminLedger() {
        const response = await fetch(`${API_URL}/admin/ledger`);
        if (!response.ok) throw new Error('Failed to fetch ledger');
        return response.json();
    },

    async getAdminBookings() {
        const response = await fetch(`${API_URL}/admin/bookings`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return response.json();
    },

    async addAdminBooking(booking: any) {
        const response = await fetch(`${API_URL}/admin/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to add booking');
        }
        return response.json();
    },

    async getAdminReports() {
        const response = await fetch(`${API_URL}/admin/reports`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        return response.json();
    },

    // --- Admin: Calendar ---
    async getAppointments() {
        const response = await fetch(`${API_URL}/admin/calendar`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        return response.json();
    },

    async addAppointment(appointment: any) {
        const response = await fetch(`${API_URL}/admin/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
        });
        if (!response.ok) throw new Error('Failed to add appointment');
        return response.json();
    },

    async updateAppointment(id: string | number, appointment: any) {
        const response = await fetch(`${API_URL}/admin/calendar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
        });
        if (!response.ok) throw new Error('Failed to update appointment');
        return response.json();
    },

    async deleteAppointment(id: string | number) {
        const response = await fetch(`${API_URL}/admin/calendar/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete appointment');
        return response.json();
    }
};
