// js/api/apiService.js

const API_BASE_URL = 'http://localhost:8080'; // Ensure this matches your backend port

class ApiService {

    // --- Animal APIs ---

    // Get available animals list
    static async getAvailableAnimals() {
        try {
            const response = await fetch(`${API_BASE_URL}/animals/available`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get animal details by ID
    static async getAnimalById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/animals/${id}`);
            if (!response.ok) throw new Error('Animal not found');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // --- User/Auth APIs ---

    // User login
    static async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return await response.json();
    }

    // User registration
    static async register(userData) {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return await response.json();
    }

    // User logout (Clear token from frontend; Backend is stateless JWT so no request needed)
    static async logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return Promise.resolve();
    }

    // --- Volunteer APIs ---

    // Submit volunteer application (Fixed: Added missing function)
    static async submitVolunteerApplication(applicationData) {
        const response = await fetch(`${API_BASE_URL}/volunteers/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(applicationData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Application failed');
        }

        return await response.json();
    }

    // --- Donation APIs (Mock / Placeholder) ---
    // Note: Backend currently has no DonationController, mocking this to prevent errors

    static async processDonation(donationData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log("Mock donation processed:", donationData);
        // Return mock success
        return { success: true, message: "Donation processed (Mock)" };
    }

    static async getRecentDonations(limit = 5) {
        // Return static mock data
        return [
            { donorName: "Zhang**", amount: 100, donationTime: new Date().toISOString() },
            { donorName: "Wang**", amount: 50, donationTime: new Date(Date.now() - 3600000).toISOString() },
            { donorName: "Li**", amount: 1000, donationTime: new Date(Date.now() - 86400000).toISOString() }
        ];
    }

    // --- Utility Methods ---

    // Check backend health
    static async checkHealth() {
        try {
            // Try requesting an endpoint that definitely exists
            const response = await fetch(`${API_BASE_URL}/animals/available`, { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    // Check if authenticated (Helper function)
    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    // Get current user data
    static getCurrentUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    }
}

// Ensure it's available on the window object (for non-module projects)
window.ApiService = ApiService;