// auth.js - 共享的认证模块
class AuthService {
    static getCurrentUser() {
        const userStr = localStorage.getItem('userData');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            this.clearAuth();
            return null;
        }
    }

    static getToken() {
        return localStorage.getItem('authToken');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'ADMIN';
    }

    static login(token, userData) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        this.updateAllPages();
    }

    static logout() {
        this.clearAuth();
        this.updateAllPages();
    }

    static clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    static updateAllPages() {
        // 触发自定义事件，让所有页面更新UI
        window.dispatchEvent(new CustomEvent('authChange'));
    }

    static initialize() {
        // 监听认证状态变化
        window.addEventListener('authChange', () => {
            this.updateUI();
        });

        // 初始更新
        this.updateUI();
    }

    static updateUI() {
        const user = this.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (!loginBtn || !registerBtn) return;

        if (user) {
            loginBtn.textContent = user.fullName || user.name || 'My Account';
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${loginBtn.textContent}`;

            registerBtn.textContent = 'Logout';
            registerBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            registerBtn.onclick = () => this.logout();
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
            loginBtn.onclick = () => document.getElementById('loginModal')?.classList.add('active');

            registerBtn.textContent = 'Register';
            registerBtn.innerHTML = `<i class="fas fa-user-plus"></i> Register`;
            registerBtn.onclick = () => document.getElementById('registerModal')?.classList.add('active');
        }
    }
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    AuthService.initialize();
});

// 暴露到全局
window.AuthService = AuthService;