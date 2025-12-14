// API配置
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080',
    TIMEOUT: 10000,
    
    // API端点常量
    ENDPOINTS: {
        // 用户相关
        LOGIN: '/users/login',
        REGISTER: '/users/register',
        LOGOUT: '/users/logout',
        CURRENT_USER: '/users/me',
        UPDATE_USER: '/users/{id}',
        
        // 动物相关
        ANIMALS_AVAILABLE: '/animals/available',
        ANIMAL_DETAIL: '/animals/{id}',
        ANIMAL_SEARCH: '/animals/search',
        ANIMAL_CATEGORIES: '/animals/categories',
        
        // 领养相关
        ADOPTION_APPLY: '/adoptions/apply',
        USER_ADOPTIONS: '/adoptions/user/{userId}',
        ADOPTION_DETAIL: '/adoptions/{id}',
        UPDATE_ADOPTION_STATUS: '/adoptions/{id}/status',
        BATCH_ADOPTION_INQUIRY: '/adoptions/batch-inquiry',
        
        // 捐赠相关
        DONATE: '/donations/donate',
        RECENT_DONATIONS: '/donations/recent',
        USER_DONATIONS: '/donations/user/{userId}',
        DONATION_STATS: '/donations/stats',
        
        // 志愿者相关
        VOLUNTEER_APPLY: '/volunteers/apply',
        VOLUNTEER_OPPORTUNITIES: '/volunteers/opportunities',
        USER_VOLUNTEER_APPLICATIONS: '/volunteers/user/{userId}',
        
        // 教育相关
        EDUCATION_ARTICLES: '/education/articles',
        ARTICLE_DETAIL: '/education/articles/{id}',
        
        // 系统相关
        UPLOAD: '/upload',
        HEALTH: '/health',
        REFRESH_TOKEN: '/users/refresh-token',
        
        // 订阅相关
        NEWSLETTER_SUBSCRIBE: '/subscriptions/newsletter',
        NEWSLETTER_UNSUBSCRIBE: '/subscriptions/unsubscribe/{token}'
    },
    
    // 获取默认请求头
    getHeaders(authToken = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        return headers;
    },
    
    // 构建完整的API URL
    buildUrl(endpoint, params = {}) {
        let url = `${this.BASE_URL}${endpoint}`;
        
        // 替换路径参数
        Object.keys(params.path || {}).forEach(key => {
            url = url.replace(`{${key}}`, encodeURIComponent(params.path[key]));
        });
        
        // 添加查询参数
        if (params.query) {
            const queryString = new URLSearchParams(params.query).toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        
        return url;
    }
};

class ApiService {
    
    // 使用配置构建URL
    static buildUrl(endpoint, pathParams = {}, queryParams = {}) {
        return API_CONFIG.buildUrl(endpoint, {
            path: pathParams,
            query: queryParams
        });
    }
    
    // 获取认证头
    static getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return API_CONFIG.getHeaders(token);
    }
    
    // 通用请求方法（使用配置）
    static async request(endpoint, options = {}) {
        const url = this.buildUrl(endpoint, options.pathParams, options.queryParams);
        
        const defaultOptions = {
            headers: this.getAuthHeaders(),
            credentials: 'include',
            timeout: API_CONFIG.TIMEOUT
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        // 移除自定义参数，避免传给fetch
        delete requestOptions.pathParams;
        delete requestOptions.queryParams;
        
        try {
            // 超时控制
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Request timeout (${API_CONFIG.TIMEOUT}ms)`)), API_CONFIG.TIMEOUT);
            });
            
            const fetchPromise = fetch(url, requestOptions);
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) {
                await this.handleErrorResponse(response);
            }
            
            return await this.parseResponse(response);
            
        } catch (error) {
            return this.handleRequestError(error, endpoint);
        }
    }
    
    // 解析响应
    static async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    }
    
    // 处理错误响应
    static async handleErrorResponse(response) {
        let errorMessage = `HTTP ${response.status}`;
        
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            
            // 处理特定错误状态码
            if (response.status === 401) {
                // 未授权，清除本地认证
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                errorMessage = 'Session expired. Please login again.';
            } else if (response.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
            } else if (response.status === 404) {
                errorMessage = 'Resource not found.';
            } else if (response.status === 429) {
                errorMessage = 'Too many requests. Please try again later.';
            } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }
        } catch (e) {
            // 无法解析JSON错误信息
        }
        
        throw new Error(errorMessage);
    }
    
    // 处理请求错误
    static handleRequestError(error, endpoint) {
        console.error(`API request failed for ${endpoint}:`, error);
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Request timeout. Please try again.');
        }
        
        throw error;
    }
    
    // 用户相关API
    static async register(userData) {
        return await this.request(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    static async login(credentials) {
        const response = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            if (response.user) {
                localStorage.setItem('userData', JSON.stringify(response.user));
            }
        }
        
        return response;
    }
    
    static async logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        try {
            await this.request(API_CONFIG.ENDPOINTS.LOGOUT, { method: 'POST' });
        } catch (error) {
            console.log('Logout API call failed, but local session cleared');
        }
        
        return { success: true };
    }
    
    static async getCurrentUser() {
        return await this.request(API_CONFIG.ENDPOINTS.CURRENT_USER);
    }
    
    static async updateUserProfile(userId, userData) {
        return await this.request(API_CONFIG.ENDPOINTS.UPDATE_USER, {
            method: 'PUT',
            pathParams: { id: userId },
            body: JSON.stringify(userData)
        });
    }
    
    // 动物相关API（使用配置中的端点）
    static async getAvailableAnimals(filters = {}) {
        return await this.request(API_CONFIG.ENDPOINTS.ANIMALS_AVAILABLE, {
            queryParams: filters
        });
    }
    
    static async getAnimalById(animalId) {
        return await this.request(API_CONFIG.ENDPOINTS.ANIMAL_DETAIL, {
            pathParams: { id: animalId }
        });
    }
    
    static async searchAnimals(searchTerm, filters = {}) {
        return await this.request(API_CONFIG.ENDPOINTS.ANIMAL_SEARCH, {
            queryParams: { q: searchTerm, ...filters }
        });
    }
    
    static async getAnimalCategories() {
        return await this.request(API_CONFIG.ENDPOINTS.ANIMAL_CATEGORIES);
    }
    
    // 领养相关API
    static async submitAdoption(applicationData) {
        return await this.request(API_CONFIG.ENDPOINTS.ADOPTION_APPLY, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }
    
    static async getUserAdoptions(userId) {
        return await this.request(API_CONFIG.ENDPOINTS.USER_ADOPTIONS, {
            pathParams: { userId }
        });
    }
    
    static async getAdoptionById(adoptionId) {
        return await this.request(API_CONFIG.ENDPOINTS.ADOPTION_DETAIL, {
            pathParams: { id: adoptionId }
        });
    }
    
    static async updateAdoptionStatus(adoptionId, status, notes = '') {
        return await this.request(API_CONFIG.ENDPOINTS.UPDATE_ADOPTION_STATUS, {
            method: 'PATCH',
            pathParams: { id: adoptionId },
            body: JSON.stringify({ status, notes })
        });
    }
    
    static async batchAdoptionInquiries(animalIds, userId) {
        return await this.request(API_CONFIG.ENDPOINTS.BATCH_ADOPTION_INQUIRY, {
            method: 'POST',
            body: JSON.stringify({ animalIds, userId })
        });
    }
    
    // 捐赠相关API
    static async processDonation(donationData) {
        return await this.request(API_CONFIG.ENDPOINTS.DONATE, {
            method: 'POST',
            body: JSON.stringify(donationData)
        });
    }
    
    static async getRecentDonations(limit = 10) {
        return await this.request(API_CONFIG.ENDPOINTS.RECENT_DONATIONS, {
            queryParams: { limit }
        });
    }
    
    static async getUserDonations(userId) {
        return await this.request(API_CONFIG.ENDPOINTS.USER_DONATIONS, {
            pathParams: { userId }
        });
    }
    
    static async getDonationStats() {
        return await this.request(API_CONFIG.ENDPOINTS.DONATION_STATS);
    }
    
    // 志愿者相关API
    static async submitVolunteerApplication(applicationData) {
        return await this.request(API_CONFIG.ENDPOINTS.VOLUNTEER_APPLY, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }
    
    static async getVolunteerOpportunities() {
        return await this.request(API_CONFIG.ENDPOINTS.VOLUNTEER_OPPORTUNITIES);
    }
    
    static async getUserVolunteerApplications(userId) {
        return await this.request(API_CONFIG.ENDPOINTS.USER_VOLUNTEER_APPLICATIONS, {
            pathParams: { userId }
        });
    }
    
    // 教育内容相关API
    static async getEducationArticles(category = null) {
        const queryParams = category ? { category } : {};
        return await this.request(API_CONFIG.ENDPOINTS.EDUCATION_ARTICLES, {
            queryParams
        });
    }
    
    static async getArticleById(articleId) {
        return await this.request(API_CONFIG.ENDPOINTS.ARTICLE_DETAIL, {
            pathParams: { id: articleId }
        });
    }
    
    // 文件上传
    static async uploadFile(file, type = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        return await this.request(API_CONFIG.ENDPOINTS.UPLOAD, {
            method: 'POST',
            headers: {}, // 让浏览器自动设置Content-Type
            body: formData
        });
    }
    
    // 系统状态检查
    static async checkHealth() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    // 订阅相关
    static async subscribeToNewsletter(email, preferences = {}) {
        return await this.request(API_CONFIG.ENDPOINTS.NEWSLETTER_SUBSCRIBE, {
            method: 'POST',
            body: JSON.stringify({ email, preferences })
        });
    }
    
    static async unsubscribeFromNewsletter(token) {
        return await this.request(API_CONFIG.ENDPOINTS.NEWSLETTER_UNSUBSCRIBE, {
            method: 'POST',
            pathParams: { token }
        });
    }
    
    // 令牌刷新
    static async refreshToken() {
        try {
            const response = await this.request(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
                method: 'POST'
            });
            
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    }
}

// 辅助函数
ApiService.isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};

ApiService.getCurrentUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

// 导出服务和配置
window.API_CONFIG = API_CONFIG;
window.ApiService = ApiService;

// 开发环境配置检测
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Development environment detected. API base URL:', API_CONFIG.BASE_URL);
}

// 导出配置供其他模块使用
export { API_CONFIG, ApiService };