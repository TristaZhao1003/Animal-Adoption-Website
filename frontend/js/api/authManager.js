// 认证管理
class AuthManager {
    constructor() {
        this.tokenKey = 'authToken';
        this.userKey = 'userData';
    }
    
    // 获取认证令牌
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }
    
    // 获取用户数据
    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }
    
    // 保存认证信息
    saveAuth(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    
    // 清除认证信息
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }
    
    // 检查是否已登录
    isLoggedIn() {
        return !!this.getToken() && !!this.getUser();
    }
    
    // 获取认证头
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

// 创建全局认证管理器
window.authManager = new AuthManager();