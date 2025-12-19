const API_BASE_URL = 'https://animal-adoption-website.onrender.com'; // Ensure this matches your backend port

class ApiService {

    // --- Animal APIs ---

    // Get available animals list (Updated with retry logic and longer timeout)
    static async getAvailableAnimals(params = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // Add authentication header
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Use the request utility method
            // Args: URL, Options, Retries (2), Timeout (60s), RetryCodes
            return await this.request(
                `${API_BASE_URL}/animals/available`,
                {
                    method: 'GET',
                    headers: headers
                },
                2,     // Retry 2 times on failure
                60000, // Timeout 60000ms (60 seconds)
                [404, 500, 502, 503, 504] // Retry on 404 as well (handles DB cold start race conditions)
            );

        } catch (error) {
            console.error('API Error (getAvailableAnimals):', error);
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

            // Use request utility with retry logic
            return await this.request(
                `${API_BASE_URL}/animals/all`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                },
                2,
                60000,
                [404, 500, 502, 503, 504] // Also retry 404 for admin endpoint
            );
        } catch (error) {
            console.error('API Error (getAllAnimals):', error);
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

    // Update animal (admin only)
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

    // Check if user is admin
    static isAdmin() {
        const user = this.getCurrentUserData();
        return user && user.role === 'ADMIN';
    }


    // --- Volunteer APIs ---

    // Submit volunteer application
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

    /**
     * Enhanced fetch request with Timeout and Retry logic.
     * Use this for critical GET requests that might fail due to Render cold start.
     * @param {string} url - The URL to fetch
     * @param {object} options - Fetch options (method, headers, etc.)
     * @param {number} retries - Number of retry attempts (default: 2)
     * @param {number} timeout - Timeout in milliseconds (default: 60000ms / 60s)
     * @param {Array} retryCodes - Status codes that trigger a retry (Default: [500, 502, 503, 504])
     */
    static async request(url, options = {}, retries = 2, timeout = 60000, retryCodes = [500, 502, 503, 504]) {
        try {
            // Create AbortController to handle timeout
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);

            // Add signal to fetch options
            const config = {
                ...options,
                signal: controller.signal
            };

            const response = await fetch(url, config);
            clearTimeout(id); // Request successful, clear timeout

            if (!response.ok) {
                // Check if the status code indicates a retry is needed
                // Added 404 to retryCodes specifically for race conditions where DB isn't ready
                if (retryCodes.includes(response.status) && retries > 0) {
                    console.warn(`Request failed (Status ${response.status}), retrying... (${retries} left)`);

                    // Wait 2s before retry (giving more time for DB/Server to stabilize)
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    return this.request(url, options, retries - 1, timeout, retryCodes);
                }

                // Try to parse error message from JSON body
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    if (errorBody.message) errorMessage = errorBody.message;
                } catch(e) { }

                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            // Handle timeout error
            if (error.name === 'AbortError') {
                console.warn(`Request timed out after ${timeout}ms`);
                if (retries > 0) {
                    console.log(`Timeout occurred, retrying... (${retries} left)`);
                    // When retrying after timeout, wait slightly longer
                    return this.request(url, options, retries - 1, timeout, retryCodes);
                }
                throw new Error('Request timed out. The server might be waking up, please try again.');
            }

            // Handle network errors or other issues
            if (retries > 0 && error.message !== 'Authentication required') {
                console.log(`Network error, retrying... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                return this.request(url, options, retries - 1, timeout, retryCodes);
            }

            console.error('Final Request failure:', error);
            throw error;
        }
    }
}
window.ApiService = ApiService;