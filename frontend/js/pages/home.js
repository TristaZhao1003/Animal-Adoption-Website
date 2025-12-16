// home.js - 使用增强版ApiService的版本

// 存储登录状态和用户信息
let currentUser = null;
let authToken = null;

// DOM 元素
const animalsGrid = document.getElementById('animalsGrid');
const donationMessagesContainer = document.getElementById('donationMessages');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const donationModal = document.getElementById('donationModal');
const volunteerModal = document.getElementById('volunteerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const closeDonationModal = document.getElementById('closeDonationModal');
const closeVolunteerModal = document.getElementById('closeVolunteerModal');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const donationForm = document.getElementById('donationForm');
const volunteerForm = document.getElementById('volunteerForm');
const donationAmounts = document.querySelectorAll('.donation-amount');
const customDonateBtn = document.getElementById('customDonateBtn');
const customAmountInput = document.getElementById('customAmount');
const findPetBtn = document.getElementById('findPetBtn');
const donateHeroBtn = document.getElementById('donateHeroBtn');
const volunteerHeroBtn = document.getElementById('volunteerHeroBtn');
const viewAllBtn = document.getElementById('viewAllBtn');
const volunteerApplyBtns = document.querySelectorAll('.volunteer-apply');
const navLinks = document.querySelectorAll('nav a');

// 当前选中的捐赠金额
let selectedDonationAmount = 100;

// 当前志愿者申请职位
let currentVolunteerRole = '';

// 从后端获取动物数据（使用ApiService）
async function fetchAnimals() {
    try {
        const animals = await ApiService.getAvailableAnimals();
        const limitedAnimals = animals.slice(0, 3);

        return limitedAnimals.map(animal => ({
            ...animal,
            // 标准化字段名
            image: animal.imageUrl || animal.image || getDefaultAnimalImage(animal.type),
            neutered: animal.spayedNeutered || animal.neutered || false,
            gender: formatGender(animal.gender),
            type: formatAnimalType(animal.type || animal.species),
            breed: animal.breed || 'Mixed Breed',
            age: animal.age || 'Unknown',
            location: animal.location || 'Unknown',
            personality: animal.personality || animal.traits || []
        }));
    } catch (error) {
        console.error('Error fetching animals:', error);
        showToast('Unable to load animals. Using fallback data.', 'warning');
        return getFallbackAnimals();
    }
}

// 获取默认动物图片
function getDefaultAnimalImage(type) {
    const typeLower = (type || '').toLowerCase();
    if (typeLower.includes('dog')) {
        return 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    } else if (typeLower.includes('cat')) {
        return 'https://images.unsplash.com/photo-1514888286974-6d03bdeacba8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    } else {
        return 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    }
}

// 格式化性别
function formatGender(gender) {
    if (!gender) return 'Unknown';
    
    const genderLower = gender.toLowerCase();
    if (genderLower === 'male' || genderLower === 'm') return 'Male';
    if (genderLower === 'female' || genderLower === 'f') return 'Female';
    return gender;
}

// 格式化动物类型
function formatAnimalType(type) {
    if (!type) return 'other';
    
    const typeLower = type.toLowerCase();
    if (typeLower.includes('dog') || typeLower === 'canine') return 'dog';
    if (typeLower.includes('cat') || typeLower === 'feline') return 'cat';
    return typeLower;
}

// 从后端获取捐赠消息（使用ApiService）
async function fetchDonationMessages() {
    try {
        const donations = await ApiService.getRecentDonations(5);
        
        return donations.map(donation => ({
            donorName: donation.donorName || donation.donor?.fullName || 'Anonymous',
            amount: donation.amount || 0,
            donationTime: formatTimeAgo(donation.createdAt || donation.donationTime || new Date())
        }));
    } catch (error) {
        console.error('Error fetching donation messages:', error);
        return [
            { donorName: "Zhang**", amount: 100, donationTime: "2 hours ago" },
            { donorName: "Wang**", amount: 50, donationTime: "5 hours ago" },
            { donorName: "Li**", amount: 1000, donationTime: "1 day ago" }
        ];
    }
}

// 格式化时间为"X time ago"格式
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

// 初始化页面
async function initPage() {
    try {
        // 显示加载状态
        showLoadingState();
        
        // 检查登录状态
        checkAuthStatus();
        
        // 并行加载数据以提高性能
        const [animals, donationMessages] = await Promise.all([
            fetchAnimals(),
            fetchDonationMessages()
        ]);
        
        // 渲染数据
        renderAnimals(animals);
        renderDonationMessages(donationMessages);
        
        // 设置捐赠金额选择
        setupDonationSelection();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 隐藏加载状态
        hideLoadingState();
        
        // 检查后端健康状态
        await checkBackendHealth();
        
    } catch (error) {
        console.error('Failed to initialize page:', error);
        hideLoadingState();
        showToast('Error loading page content. Please refresh.', 'error');
    }
}

// 显示加载状态
function showLoadingState() {
    if (animalsGrid) {
        animalsGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p>Loading animals...</p>
            </div>
        `;
    }
    
    // 添加CSS样式
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .loading-state {
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }
}

// 隐藏加载状态
function hideLoadingState() {
    const loadingState = document.querySelector('.loading-state');
    if (loadingState) {
        loadingState.remove();
    }
}

// 检查后端健康状态
async function checkBackendHealth() {
    try {
        const isHealthy = await ApiService.checkHealth();
        if (!isHealthy) {
            console.warn('Backend health check failed');
            showToast('Backend connection issue. Some features may be limited.', 'warning', 5000);
        }
    } catch (error) {
        console.warn('Unable to check backend health:', error);
    }
}

// 检查用户认证状态（使用ApiService辅助函数）
function checkAuthStatus() {
    if (ApiService.isAuthenticated()) {
        authToken = localStorage.getItem('authToken');
        currentUser = ApiService.getCurrentUserData();
        updateAuthButtons();
    }
}

// 更新认证按钮状态
function updateAuthButtons() {
    if (currentUser) {
        loginBtn.textContent = currentUser.fullName || currentUser.name || 'My Account';
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${loginBtn.textContent}`;
        registerBtn.textContent = 'Logout';
        registerBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
        registerBtn.textContent = 'Register';
        registerBtn.innerHTML = `<i class="fas fa-user-plus"></i> Register`;
    }
}

// 渲染动物卡片
function renderAnimals(animals) {
    if (!animalsGrid) return;
    
    if (animals.length === 0) {
        animalsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-paw" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                <h3>No Animals Available</h3>
                <p>Check back later for new arrivals!</p>
            </div>
        `;
        return;
    }
    
    animalsGrid.innerHTML = '';
    
    animals.forEach(animal => {
        const statusConfig = getStatusConfig(animal.status);
        
        // 处理personality数据
        let personalityText = '';
        if (Array.isArray(animal.personality)) {
            personalityText = animal.personality.join(', ');
        } else if (animal.personality) {
            personalityText = animal.personality;
        }
        
        const animalCard = document.createElement('div');
        animalCard.className = 'animal-card';
        animalCard.dataset.id = animal.id;
        animalCard.innerHTML = `
            <img src="${animal.image}" alt="${animal.name}" class="animal-img" onerror="this.src='${getDefaultAnimalImage(animal.type)}'">
            <div class="animal-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3>${animal.name}</h3>
                    <span class="status ${statusConfig.class}">
                        ${statusConfig.text}
                    </span>
                </div>
                <div class="animal-meta">
                    <div class="meta-item">
                        <i class="fas ${animal.type === 'dog' ? 'fa-dog' : 'fa-cat'}"></i>
                        <span>${formatBreedText(animal.type, animal.breed)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas ${animal.gender === 'Male' ? 'fa-mars' : 'fa-venus'}"></i>
                        <span>${animal.gender}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-birthday-cake"></i>
                        <span>${animal.age}</span>
                    </div>
                </div>
                ${personalityText ? `<p><strong>Personality:</strong> ${personalityText}</p>` : ''}
                <p><strong>Location:</strong> ${animal.location}</p>
                <p><strong>Spay/Neuter Status:</strong> ${animal.neutered ? 'Spayed/Neutered' : 'Not Yet'}</p>
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary view-animal-btn" data-id="${animal.id}" 
                        ${!statusConfig.available ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                        <i class="fas fa-info-circle"></i> 
                        ${statusConfig.available ? 'View Details' : 'Not Available'}
                    </button>
                </div>
            </div>
        `;
        
        animalsGrid.appendChild(animalCard);
    });
    
    // 为新增的按钮添加事件监听
    setupAnimalCardEvents();
}

// 获取状态配置
function getStatusConfig(status) {
    const statusUpper = (status || '').toUpperCase();
    
    const configs = {
        'AVAILABLE': { 
            text: 'Available for Adoption', 
            class: 'status-available', 
            available: true 
        },
        'RESERVED': { 
            text: 'Reserved', 
            class: 'status-reserved', 
            available: false 
        },
        'ADOPTED': { 
            text: 'Adopted', 
            class: 'status-adopted', 
            available: false 
        },
        'PENDING': { 
            text: 'Pending Review', 
            class: 'status-reserved', 
            available: false 
        }
    };
    
    return configs[statusUpper] || { 
        text: 'Available for Adoption', 
        class: 'status-available', 
        available: true 
    };
}

// 格式化品种文本
function formatBreedText(type, breed) {
    const typeText = type === 'dog' ? 'Dog' : type === 'cat' ? 'Cat' : 'Pet';
    return breed ? `${typeText} · ${breed}` : typeText;
}

// 设置动物卡片事件
function setupAnimalCardEvents() {
    document.querySelectorAll('.view-animal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const animalId = this.getAttribute('data-id');
            viewAnimalDetails(animalId);
        });
    });
    
    // 点击整个卡片也可以查看详情（除了按钮区域）
    document.querySelectorAll('.animal-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是按钮或链接，不触发卡片点击
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            
            const animalId = this.dataset.id;
            viewAnimalDetails(animalId);
        });
    });
}

// 渲染捐赠消息
function renderDonationMessages(donationMessages) {
    if (!donationMessagesContainer) return;
    
    if (donationMessages.length === 0) {
        donationMessagesContainer.innerHTML = `
            <div class="empty-donations" style="text-align: center; padding: 20px; color: #666;">
                <i class="fas fa-heart" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>No recent donations yet. Be the first to donate!</p>
            </div>
        `;
        return;
    }
    
    donationMessagesContainer.innerHTML = '';
    
    donationMessages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'donation-message';
        messageElement.innerHTML = `
            <div>
                <strong>${message.donorName}</strong> donated
            </div>
            <div>
                <strong>$${message.amount.toLocaleString()}</strong>
                <span style="color: #777; font-size: 0.9rem; margin-left: 10px;">
                    ${message.donationTime}
                </span>
            </div>
        `;
        
        donationMessagesContainer.appendChild(messageElement);
    });
}

// 设置捐赠金额选择
function setupDonationSelection() {
    donationAmounts.forEach(amountEl => {
        amountEl.addEventListener('click', function() {
            donationAmounts.forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            selectedDonationAmount = parseInt(this.getAttribute('data-amount'));
            customAmountInput.value = selectedDonationAmount;
        });
    });
    
    // 默认选择$100
    if (donationAmounts.length > 0) {
        document.querySelector('.donation-amount[data-amount="100"]')?.classList.add('selected');
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 导航链接点击事件
    setupNavigationLinks();
    
    // 认证相关事件
    setupAuthEvents();
    
    // 捐赠相关事件
    setupDonationEvents();
    
    // 志愿者相关事件
    setupVolunteerEvents();
    
    // 其他按钮事件
    setupOtherButtonEvents();
    
    // 模态框关闭事件
    setupModalCloseEvents();
}

// 设置导航链接
function setupNavigationLinks() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // 如果是锚点链接，阻止默认行为并平滑滚动
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                scrollToSection(targetId, this);
            }
        });
    });
}

// 滚动到页面部分
function scrollToSection(sectionId, activeLink = null) {
    const targetSection = document.getElementById(sectionId);
    
    if (targetSection) {
        if (activeLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            activeLink.classList.add('active');
        }
        
        window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // 更新URL哈希（不触发页面跳转）
        history.replaceState(null, null, `#${sectionId}`);
    }
}

// 设置认证事件
function setupAuthEvents() {
    // 登录按钮点击事件
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (currentUser) {
                window.location.href = 'my-account.html';
            } else {
                loginModal.classList.add('active');
            }
        });
    }
    
    // 注册/登出按钮点击事件
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            if (currentUser) {
                logout();
            } else {
                registerModal.classList.add('active');
            }
        });
    }
    
    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            await handleLogin(email, password);
        });
    }
    
    // 注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const phone = document.getElementById('registerPhone').value;
            
            await handleRegister({ name, email, password, phone });
        });
    }
    
    // 切换登录/注册模态框
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(loginModal, registerModal);
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(registerModal, loginModal);
        });
    }
}

// 切换模态框
function switchModal(fromModal, toModal) {
    fromModal.classList.remove('active');
    setTimeout(() => {
        toModal.classList.add('active');
    }, 300);
}

// 设置捐赠事件
function setupDonationEvents() {
    // 捐赠按钮事件
    if (customDonateBtn) {
        customDonateBtn.addEventListener('click', () => {
            const customAmount = parseInt(customAmountInput.value);
            
            if (isNaN(customAmount) || customAmount < 50) {
                showToast('Please enter an amount of at least $50', 'error');
                return;
            }
            
            selectedDonationAmount = customAmount;
            showDonationModal();
        });
    }
    
    // 捐赠金额选择事件
    donationAmounts.forEach(amountEl => {
        amountEl.addEventListener('click', function() {
            const amount = parseInt(this.getAttribute('data-amount'));
            selectedDonationAmount = amount;
            
            setTimeout(() => {
                showDonationModal();
            }, 300);
        });
    });
    
    // 捐赠表单提交事件
    if (donationForm) {
        donationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await processDonation();
        });
    }
}

// 设置志愿者事件
function setupVolunteerEvents() {
    // 志愿者申请按钮事件
    volunteerApplyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentVolunteerRole = this.getAttribute('data-role');
            const roleText = this.closest('.opportunity-card').querySelector('h3').textContent;
            if (document.getElementById('volunteerRole')) {
                document.getElementById('volunteerRole').value = roleText;
            }
            volunteerModal.classList.add('active');
        });
    });
    
    // 志愿者表单提交事件
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitVolunteerApplication();
        });
    }
}

// 设置其他按钮事件
function setupOtherButtonEvents() {
    // 英雄区域按钮事件
    if (findPetBtn) findPetBtn.addEventListener('click', () => navigateToBrowsePage());
    if (donateHeroBtn) donateHeroBtn.addEventListener('click', () => showDonationModal());
    if (volunteerHeroBtn) volunteerHeroBtn.addEventListener('click', () => volunteerModal.classList.add('active'));
    
    // 查看所有按钮
    if (viewAllBtn) viewAllBtn.addEventListener('click', () => navigateToBrowsePage());
}

// 设置模态框关闭事件
function setupModalCloseEvents() {
    // 关闭按钮事件
    if (closeLoginModal) closeLoginModal.addEventListener('click', () => loginModal.classList.remove('active'));
    if (closeRegisterModal) closeRegisterModal.addEventListener('click', () => registerModal.classList.remove('active'));
    if (closeDonationModal) closeDonationModal.addEventListener('click', () => donationModal.classList.remove('active'));
    if (closeVolunteerModal) closeVolunteerModal.addEventListener('click', () => volunteerModal.classList.remove('active'));
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.remove('active');
        if (e.target === registerModal) registerModal.classList.remove('active');
        if (e.target === donationModal) donationModal.classList.remove('active');
        if (e.target === volunteerModal) volunteerModal.classList.remove('active');
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            loginModal.classList.remove('active');
            registerModal.classList.remove('active');
            donationModal.classList.remove('active');
            volunteerModal.classList.remove('active');
        }
    });
}

// 处理登录（使用ApiService）
async function handleLogin(email, password) {
    try {
        showButtonLoading(loginForm.querySelector('button[type="submit"]'));
        
        const result = await ApiService.login({ email, password });
        
        // 保存认证信息
        authToken = result.token;
        currentUser = result.user;
        
        // 更新UI
        updateAuthButtons();
        loginModal.classList.remove('active');
        
        // 重置表单
        loginForm.reset();
        
        showToast('Login successful! Welcome back!', 'success');
        
        // 刷新页面数据（如果需要）
        await refreshPageData();
        
    } catch (error) {
        console.error('Login error:', error);
        showToast(`Login failed: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(loginForm.querySelector('button[type="submit"]'));
    }
}

// 处理注册（使用ApiService）
async function handleRegister(userData) {
    try {
        showButtonLoading(registerForm.querySelector('button[type="submit"]'));
        
        const result = await ApiService.register(userData);
        
        // 自动登录
        await handleLogin(userData.email, userData.password);
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast(`Registration failed: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(registerForm.querySelector('button[type="submit"]'));
    }
}

// 处理登出（使用ApiService）
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await ApiService.logout();
            
            // 清除本地状态
            authToken = null;
            currentUser = null;
            
            // 更新UI
            updateAuthButtons();
            
            showToast('Logged out successfully!', 'success');
            
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Logout failed', 'error');
        }
    }
}

// 处理捐赠（使用ApiService）
async function processDonation() {
    const email = document.getElementById('donorEmail').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!currentUser && !email) {
        showToast('Please provide your email address or login first.', 'error');
        return;
    }
    
    const donationData = {
        amount: selectedDonationAmount,
        donorEmail: email || currentUser?.email,
        paymentMethod: paymentMethod,
        donorName: currentUser ? currentUser.fullName || currentUser.name : null,
        userId: currentUser ? currentUser.id : null
    };
    
    try {
        showButtonLoading(donationForm.querySelector('button[type="submit"]'));
        
        const result = await ApiService.processDonation(donationData);
        
        showToast(`Thank you for your donation of $${selectedDonationAmount.toLocaleString()}!`, 'success');
        donationModal.classList.remove('active');
        
        // 重置表单
        donationForm.reset();
        
        // 刷新捐赠消息
        const donationMessages = await fetchDonationMessages();
        renderDonationMessages(donationMessages);
        
    } catch (error) {
        console.error('Donation error:', error);
        showToast(`Donation failed: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(donationForm.querySelector('button[type="submit"]'));
    }
}

// 提交志愿者申请（使用ApiService）
async function submitVolunteerApplication() {
    const name = document.getElementById('volunteerName').value;
    const email = document.getElementById('volunteerEmail').value;
    const phone = document.getElementById('volunteerPhone').value;
    const experience = document.getElementById('volunteerExperience').value;
    const availability = document.getElementById('volunteerAvailability').value;
    
    const applicationData = {
        fullName: name,
        email: email,
        phone: phone,
        role: currentVolunteerRole,
        experience: experience,
        availability: availability,
        userId: currentUser ? currentUser.id : null,
        applicationDate: new Date().toISOString()
    };
    
    try {
        showButtonLoading(volunteerForm.querySelector('button[type="submit"]'));
        
        await ApiService.submitVolunteerApplication(applicationData);
        
        showToast('Volunteer application submitted successfully! We will contact you soon.', 'success');
        volunteerModal.classList.remove('active');
        
        // 重置表单
        volunteerForm.reset();
        
    } catch (error) {
        console.error('Volunteer application error:', error);
        showToast(`Application failed: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(volunteerForm.querySelector('button[type="submit"]'));
    }
}

// 显示捐赠模态框
function showDonationModal() {
    const donationDetails = document.getElementById('donationDetails');
    
    if (!donationDetails) return;
    
    const descriptions = {
        50: 'This donation can provide one week of food for an animal.',
        100: 'This donation can cover the cost of a medical check-up for one animal.',
        1000: 'This donation can support one necessary surgical procedure for an animal.'
    };
    
    const description = descriptions[selectedDonationAmount] || 
        'This donation will be used for the animals\' medical care, food, and shelter.';
    
    donationDetails.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: var(--accent-color); font-size: 2.5rem;">$${selectedDonationAmount.toLocaleString()}</h3>
            <p>${description}</p>
        </div>
    `;
    
    donationModal.classList.add('active');
}

// 查看动物详情 - 跳转到 adoption.html 显示该动物详情
async function viewAnimalDetails(animalId) {
    try {
        // 直接跳转到 adoption.html 并传递动物ID参数
        // 使用URL参数方式，更可靠
        window.location.href = `adoption.html?animal=${animalId}&from=home`;

    } catch (error) {
        console.error('Error viewing animal details:', error);
        showToast('Unable to view animal details. Please try again.', 'error');
    }
}

// 导航到浏览页面
function navigateToBrowsePage() {
    window.location.href = 'browse-animals.html';
}

// 刷新页面数据
async function refreshPageData() {
    try {
        const [animals, donationMessages] = await Promise.all([
            fetchAnimals(),
            fetchDonationMessages()
        ]);
        
        renderAnimals(animals);
        renderDonationMessages(donationMessages);
        
    } catch (error) {
        console.error('Error refreshing page data:', error);
    }
}

// 显示按钮加载状态
function showButtonLoading(button) {
    if (!button) return;
    
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
}

// 隐藏按钮加载状态
function hideButtonLoading(button) {
    if (!button || !button.dataset.originalText) return;
    
    button.innerHTML = button.dataset.originalText;
    button.disabled = false;
    delete button.dataset.originalText;
}

// 显示Toast通知
function showToast(message, type = 'info', duration = 3000) {
    // 移除现有的toast
    document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getToastColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
    `;
    
    const icon = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${icon}" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px; font-size: 1.2rem;">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // 自动移除
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
    
    // 添加CSS动画
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 获取Toast颜色
function getToastColor(type) {
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8'
    };
    return colors[type] || '#17a2b8';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// 暴露必要函数到全局作用域
window.viewAnimalDetails = viewAnimalDetails;
window.navigateToBrowsePage = navigateToBrowsePage;