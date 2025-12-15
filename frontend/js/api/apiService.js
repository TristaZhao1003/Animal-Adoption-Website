// js/api/apiService.js

const API_BASE_URL = 'http://localhost:8080'; // 确保这里与你的后端端口一致

class ApiService {

    // 获取可用宠物列表
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

    // 获取单个宠物详情
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

    // 用户登录
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

    // 用户注册
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

    // 检查是否登录 (辅助函数)
    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
}

// 确保在 window 对象上可用（如果是没有使用模块化打包的项目）
window.ApiService = ApiService;