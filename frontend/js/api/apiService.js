// js/api/apiService.js

const API_BASE_URL = 'https://animal-adoption-website.onrender.com'; // Ensure this matches your backend port

class ApiService {

    // --- Animal APIs ---

    // Get available animals list
    static async getAvailableAnimals(params = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // 添加认证头
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/animals/available`, {
                method: 'GET',
                headers: headers
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

    // Get ALL animals (including unavailable) - for admin only
    static async getAllAnimals() {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${API_BASE_URL}/animals/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    // Update animal (admin only) - FIXED
    static async updateAnimal(id, animalData) {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            // First get the current animal to update all fields
            const currentAnimal = await this.getAnimalById(id);

            // Prepare update data with all fields
            const updateData = {
                id: id,
                name: animalData.name || currentAnimal.name,
                type: animalData.type || currentAnimal.type,
                breed: animalData.breed || currentAnimal.breed,
                age: animalData.age || currentAnimal.age,
                gender: animalData.gender || currentAnimal.gender,
                location: animalData.location || currentAnimal.location,
                size: animalData.size || currentAnimal.size,
                neutered: animalData.neutered !== undefined ? animalData.neutered : currentAnimal.neutered,
                status: animalData.status || currentAnimal.status,
                image: animalData.image || currentAnimal.image,
                story: animalData.story || currentAnimal.story,
                personality: animalData.personality || currentAnimal.personality || []
            };

            // Log for debugging
            console.log('Sending update data:', updateData);

            const response = await fetch(`${API_BASE_URL}/animals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update failed:', errorText);
                throw new Error(`Failed to update animal: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;

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


    // Update UI after login
    static updateUIAfterLogin() {
        const user = this.getCurrentUserData();
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (user && loginBtn && registerBtn) {
            // Update login button to show user name
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.fullName || 'My Account'}`;
            loginBtn.title = `Logged in as ${user.fullName} (${user.role})`;

            // Update register button to show logout
            registerBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            registerBtn.onclick = () => this.logout();

            // Show admin indicator if user is admin
            if (user.role === 'ADMIN') {
                this.showAdminIndicator();
            }

            // Refresh animal cards to show edit buttons
            if (typeof window.refreshAnimals === 'function') {
                window.refreshAnimals();
            }
        }
    }


    // Update UI after logout
    static updateUIAfterLogout() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (loginBtn && registerBtn) {
            loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
            loginBtn.title = '';
            loginBtn.onclick = () => document.getElementById('loginModal')?.classList.add('active');

            registerBtn.innerHTML = `<i class="fas fa-user-plus"></i> Sign up`;
            registerBtn.onclick = () => document.getElementById('registerModal')?.classList.add('active');

            // Hide admin indicator
            this.hideAdminIndicator();

            // Refresh animal cards to hide edit buttons
            if (typeof window.refreshAnimals === 'function') {
                window.refreshAnimals();
            }
        }
    }


    // Show admin indicator
    static showAdminIndicator() {
        // Remove existing indicator
        this.hideAdminIndicator();

        // Create admin badge
        const adminBadge = document.createElement('div');
        adminBadge.id = 'adminBadge';
        adminBadge.innerHTML = `
            <span style="background: #28a745; color: white; padding: 3px 8px; border-radius: 3px; 
                font-size: 12px; margin-left: 10px;">
                <i class="fas fa-crown"></i> ADMIN
            </span>
        `;

        // Add to auth buttons container
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.appendChild(adminBadge);
        }
    }

    // Hide admin indicator
    static hideAdminIndicator() {
        const existingBadge = document.getElementById('adminBadge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }

    // Check authentication
    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    // Get current user data
    static getCurrentUserData() {
        const userData = localStorage.getItem('userData');
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }

    // Check if user is admin - SIMPLIFIED
    static isAdmin() {
        const user = this.getCurrentUserData();
        console.log('Checking admin status:', user);
        return user && user.role === 'ADMIN';
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