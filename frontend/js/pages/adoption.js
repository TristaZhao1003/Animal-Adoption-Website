// adoption.js - Fixed version with Auth logic and Toast feedback

// DOM Elements
const animalsGrid = document.getElementById('animalsGrid');
const emptyState = document.getElementById('emptyState');
const pagination = document.getElementById('pagination');
const totalAnimalsEl = document.getElementById('totalAnimals');
const dogsCountEl = document.getElementById('dogsCount');
const catsCountEl = document.getElementById('catsCount');
const otherCountEl = document.getElementById('otherCount');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const resetEmptyBtn = document.getElementById('resetEmptyBtn');
const animalDetailModal = document.getElementById('animalDetailModal');
const closeAnimalModal = document.getElementById('closeAnimalModal');
const animalDetailHeader = document.getElementById('animalDetailHeader');
const animalDetailBody = document.getElementById('animalDetailBody');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbers = document.getElementById('pageNumbers');

// Auth Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

// Filter elements
const animalTypeFilter = document.getElementById('animalType');
const breedFilter = document.getElementById('breed');
const ageFilter = document.getElementById('age');
const genderFilter = document.getElementById('gender');
const sizeFilter = document.getElementById('size');
const locationFilter = document.getElementById('location');
const neuteredFilter = document.getElementById('neutered');
const personalityFilter = document.getElementById('personality');

// State
let animals = []; // Data will be loaded from API
let filteredAnimals = [];
let currentPage = 1;
const animalsPerPage = 6;
let currentFilters = {
    animalType: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    location: '',
    neutered: '',
    personality: '',
    search: ''
};
let editModal = null;
let currentEditingAnimal = null;
let currentUser = null;
let authToken = null;

// Check user authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('userData');

    if (token && userStr) {
        authToken = token;
        try {
            currentUser = JSON.parse(userStr);
            updateAuthButtons();
        } catch (e) {
            console.error("Error parsing user data", e);
            // 清理无效数据
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            currentUser = null;
            authToken = null;
            updateAuthButtons(); // 更新按钮状态
        }
    } else {
        // 没有认证数据，确保状态正确
        currentUser = null;
        authToken = null;
        updateAuthButtons();
    }
}

// Update Header Buttons (Login/Register <-> User/Logout)
function updateAuthButtons() {
    if (currentUser) {
        if(loginBtn) {
            loginBtn.textContent = currentUser.fullName || currentUser.name || 'My Account';
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.fullName || currentUser.name || 'Account'}`;
            // 移除旧的监听器，添加新的
            loginBtn.onclick = () => {
                alert("Profile page still in progress...☕️");
            };
        }

        if(registerBtn) {
            registerBtn.textContent = 'Logout';
            registerBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            registerBtn.onclick = logout;
        }
    } else {
        // 未登录状态
        if(loginBtn) {
            loginBtn.innerHTML = 'Log in';
            loginBtn.onclick = () => loginModal.classList.add('active');
        }
        if(registerBtn) {
            registerBtn.innerHTML = 'Sign up';
            registerBtn.onclick = () => registerModal.classList.add('active');
        }
    }
}


// Helper function: Get status configuration
function getStatusConfig(status) {
    const statusUpper = (status || 'AVAILABLE').toUpperCase();

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
        text: statusUpper,
        class: 'status-unknown',
        available: false
    };
}

// Initialize page
async function initPage() {
    try {
        // 检查URL参数 - 是否从首页跳转过来需要显示特定动物
        const urlParams = new URLSearchParams(window.location.search);
        const animalIdFromHome = urlParams.get('animal');
        const fromHomePage = urlParams.get('from');

        // 如果有来自首页的动物ID，保存到全局变量
        if (animalIdFromHome && fromHomePage === 'home') {
            // 清理URL参数，避免刷新后重复触发
            window.history.replaceState({}, document.title, window.location.pathname);
            window.targetAnimalId = animalIdFromHome; // 保存到全局变量
        }

        // Show loading state
        if (animalsGrid) {
            animalsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">Loading animals...</div>';
        }

        // 1. Check Auth Status - 这会更新 currentUser 和 authToken
        checkAuthStatus();

        // 2. Fetch data from backend
        await fetchAnimals();

        // 3. Initialize filters
        filteredAnimals = [...animals];

        // 4. Render page
        renderAnimals();
        updateStats();
        setupEventListeners();

        // 5. 如果有目标动物ID，显示其详情
        if (window.targetAnimalId) {
            // 短暂延迟确保页面渲染完成
            setTimeout(() => {
                showAnimalDetails(window.targetAnimalId);
                // 计算并跳转到该动物所在的页码
                jumpToAnimalPage(window.targetAnimalId);
                // 清理全局变量
                delete window.targetAnimalId;
            }, 500);
        }

    } catch (error) {
        console.error("Failed to init adoption page:", error);
        if (animalsGrid) {
            animalsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Failed to load data. Please check backend connection.</div>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    checkAuthStatus();

    // 如果有 AuthService，使用它
    if (typeof AuthService !== 'undefined' && AuthService.isAuthenticated()) {
        currentUser = AuthService.getCurrentUser();
        authToken = AuthService.getToken();
    }

    // 初始化页面
    initPage();
});

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = loginForm.querySelector('button[type="submit"]');

    try {
        showButtonLoading(btn);
        const result = await ApiService.login({ email, password });

        // 保存认证信息
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.user));

        // 更新本地状态
        authToken = result.token;
        currentUser = result.user;

        // 显示成功消息
        showToast('Login successful! Welcome back!', 'success');

        // 关闭登录模态框
        loginModal.classList.remove('active');

        // 重置表单
        loginForm.reset();

        // 更新UI
        updateAuthButtons();

    } catch (error) {
        console.error('Login error:', error);
        showToast(`Login failed: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(btn);
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;
    const btn = registerForm.querySelector('button[type="submit"]');

    try {
        showButtonLoading(btn);
        await ApiService.register({ name, email, password, phone });

        showToast('Registration successful! Logging you in...', 'success');

        // 自动登录
        const result = await ApiService.login({ email, password });
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userData', JSON.stringify(result.user));
        authToken = result.token;
        currentUser = result.user;

        // 关闭注册模态框
        registerModal.classList.remove('active');

        // 重置表单
        registerForm.reset();

        // 更新UI
        updateAuthButtons();

        showToast('Login successful! Welcome!', 'success');

    } catch (error) {
        console.error('Registration error:', error);
        showToast(`Registration failed: ${error.message}`, 'error');
    } finally {
        hideButtonLoading(btn);
    }
}

// Handle Logout
function logout() {
    console.log('logout function called');

    // 检查是否已经有登出在进行中
    if (window.logoutInProgress) {
        console.log('Logout already in progress, skipping');
        return;
    }

    // 设置标志防止重复执行
    window.logoutInProgress = true;

    // 显示确认对话框
    const confirmed = confirm("Are you sure you want to logout?");

    if (!confirmed) {
        window.logoutInProgress = false;
        return;
    }

    try {
        console.log('Processing logout...');

        // 1. 清除本地存储
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');

        // 2. 清除本地变量
        currentUser = null;
        authToken = null;

        // 3. 显示成功消息
        showToast('Logged out successfully! Refreshing page...', 'success');

        // 4. 刷新页面
        setTimeout(() => {
            console.log('Refreshing page...');
            window.location.reload();
        }, 800);

    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed: ' + error.message, 'error');
        window.logoutInProgress = false;
    }
}

// Fetch and process animal data from API
async function fetchAnimals() {
    try {
        // 检查是否是admin
        const isAdmin = ApiService.isAdmin();

        let rawAnimals;

        if (isAdmin) {
            // Admin: 获取所有动物（包括 unavailable）
            try {
                rawAnimals = await ApiService.getAllAnimals();
                console.log('Admin mode: Loaded all animals including unavailable');
            } catch (error) {
                console.log('Admin API failed, falling back to available animals:', error);
                rawAnimals = await ApiService.getAvailableAnimals();
            }
        } else {
            // 普通用户：只获取可用的动物
            rawAnimals = await ApiService.getAvailableAnimals();
        }

        // Map backend data to frontend format
        animals = rawAnimals.map(animal => {
            const age = animal.age || 'Unknown';
            return {
                id: animal.id,
                name: animal.name,
                type: formatAnimalType(animal.type),
                breed: animal.breed || 'Mixed',
                age: age,
                ageCategory: calculateAgeCategory(age),
                gender: formatGender(animal.gender),
                size: (animal.size || 'medium').toLowerCase(),
                location: animal.location || 'Unknown',
                personality: animal.personality || [],
                personalityTags: (animal.personality || []).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                status: animal.status || 'AVAILABLE', // 确保有status字段
                image: animal.image || getDefaultAnimalImage(animal.type),
                neutered: animal.neutered,
                story: animal.story || 'No story available.',
                rawType: animal.type // 保存原始类型用于编辑
            };
        });

        console.log(`Loaded ${animals.length} animals (Admin: ${isAdmin})`);

    } catch (error) {
        console.error('Error fetching animals:', error);
        animals = [];
        showToast('Failed to load animals from server.', 'error');
    }
}

// Helper function: Calculate age category (for filtering)
function calculateAgeCategory(ageStr) {
    const str = ageStr.toLowerCase();
    if (str.includes('month')) return 'puppy';

    // Extract number
    const match = str.match(/(\d+)/);
    if (!match) return 'adult';

    const years = parseInt(match[0]);
    if (years <= 1) return 'puppy';
    if (years <= 3) return 'young';
    if (years <= 8) return 'adult';
    return 'senior';
}

// Helper function: Format animal type
function formatAnimalType(type) {
    if (!type) return 'other';
    const t = type.toLowerCase();
    if (t.includes('dog')) return 'dog';
    if (t.includes('cat')) return 'cat';
    return 'other';
}

// Helper function: Format gender
function formatGender(gender) {
    if (!gender) return 'Unknown';
    const g = gender.toLowerCase();
    return (g === 'male' || g === 'm') ? 'male' : 'female';
}

// Helper function: Get default image
function getDefaultAnimalImage(type) {
    if (type === 'dog') return 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80';
    if (type === 'cat') return 'https://images.unsplash.com/photo-1514888286974-6d03bdeacba8?w=600&q=80';
    return 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&q=80';
}

// Render animals based on current filters and pagination
function renderAnimals() {
    animalsGrid.innerHTML = '';

    // Admin可以查看所有动物，普通用户只查看可用的
    let animalsToDisplay = filteredAnimals;

    // if (!ApiService.isAdmin()) {
    //     // 普通用户：只显示可用的动物
    //     animalsToDisplay = filteredAnimals.filter(animal =>
    //         animal.status === 'AVAILABLE' || animal.status === 'Available'
    //     );
    // }

    if (!ApiService.isAdmin()) {
        animalsToDisplay = filteredAnimals.filter(animal =>
            ['AVAILABLE', 'Available', 'RESERVED', 'Reserved', 'ADOPTED', 'Adopted'].includes(animal.status)
        );
    }

    if (animalsToDisplay.length === 0) {
        animalsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    animalsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Calculate pagination
    const totalPages = Math.ceil(animalsToDisplay.length / animalsPerPage);
    const startIndex = (currentPage - 1) * animalsPerPage;
    const endIndex = Math.min(startIndex + animalsPerPage, animalsToDisplay.length);
    const pageAnimals = animalsToDisplay.slice(startIndex, endIndex);

    // Render animal cards
    pageAnimals.forEach(animal => {
        const animalCard = createAnimalCard(animal);
        animalsGrid.appendChild(animalCard);
    });

    // Update pagination
    updatePagination(totalPages);
}

// Create animal card element
function createAnimalCard(animal) {
    const isAdmin = ApiService.isAdmin();
    const statusConfig = getStatusConfig(animal.status);
    const isAvailable = statusConfig.available;

    // 根据状态决定是否禁用按钮
    const viewBtnDisabled = !isAvailable && !isAdmin;
    const adoptBtnDisabled = !isAvailable;

    // 状态标签颜色
    const statusColor = {
        'AVAILABLE': 'green',
        'RESERVED': 'orange',
        'ADOPTED': 'red',
        'PENDING': 'blue'
    }[animal.status?.toUpperCase()] || 'gray';

    const animalCard = document.createElement('div');
    animalCard.className = 'animal-card';
    animalCard.innerHTML = `
        <div style="position: relative;">
            <img src="${animal.image}" alt="${animal.name}" class="animal-img" onerror="this.src='${getDefaultAnimalImage(animal.type)}'">
            ${isAdmin && !isAvailable ? `
                <div style="position: absolute; top: 10px; right: 10px; background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${animal.status}
                </div>
            ` : ''}
        </div>
        <div class="animal-info">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>${animal.name}</h3>
                ${!isAvailable ? `
                    <span style="color: ${statusColor}; font-size: 12px; font-weight: bold;">
                        ${animal.status}
                    </span>
                ` : ''}
            </div>
            <div class="animal-meta">
                <div class="meta-item">
                    <i class="fas ${animal.type === 'dog' ? 'fa-dog' : 'fa-cat'}"></i>
                    <span>${animal.breed}</span>
                </div>
                <div class="meta-item">
                    <i class="fas ${animal.gender === 'male' ? 'fa-mars' : 'fa-venus'}"></i>
                    <span>${animal.gender === 'male' ? 'Male' : 'Female'}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-birthday-cake"></i>
                    <span>${animal.age}</span>
                </div>
            </div>
            <div class="personality-tags">
                ${animal.personalityTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <p><strong>Location:</strong> ${animal.location}</p>
            <p><strong>Size:</strong> ${animal.size.charAt(0).toUpperCase() + animal.size.slice(1)}</p>
            <p><strong>Neutered/Spayed:</strong> ${animal.neutered ? 'Yes' : 'No'}</p>
            <div class="card-actions">
                <button class="btn ${isAdmin ? 'btn-warning' : 'btn-primary'} btn-card view-detail-btn" 
                        data-id="${animal.id}"
                        ${viewBtnDisabled ? 'disabled style="opacity: 0.6;"' : ''}>
                    <i class="fas ${isAdmin ? 'fa-edit' : 'fa-info-circle'}"></i> 
                    ${isAdmin ? 'Edit' : 'View Details'}
                </button>
                <button class="btn btn-accent btn-card adopt-btn" 
                        data-id="${animal.id}"
                        ${adoptBtnDisabled ? 'disabled style="opacity: 0.6; background: #ccc;"' : ''}>
                    <i class="fas fa-heart"></i> 
                    ${!isAvailable ? 'Not Available' : 'Adopt Me'}
                </button>
            </div>
        </div>
    `;

    return animalCard;
}

// Update statistics
function updateStats() {
    // 对于admin，显示所有动物的统计
    // 对于普通用户，只显示可用动物的统计
    const displayAnimals = ApiService.isAdmin() ?
        filteredAnimals :
        filteredAnimals.filter(animal => animal.status === 'AVAILABLE' || animal.status === 'Available');

    totalAnimalsEl.textContent = displayAnimals.length;
    dogsCountEl.textContent = displayAnimals.filter(a => a.type === 'dog').length;
    catsCountEl.textContent = displayAnimals.filter(a => a.type === 'cat').length;
    otherCountEl.textContent = displayAnimals.filter(a => a.type !== 'dog' && a.type !== 'cat').length;
}

// Update pagination controls
function updatePagination(totalPages) {
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    prevPageBtn.disabled = currentPage === 1;
    prevPageBtn.classList.toggle('disabled', currentPage === 1);
    nextPageBtn.disabled = currentPage === totalPages;
    nextPageBtn.classList.toggle('disabled', currentPage === totalPages);

    pageNumbers.innerHTML = '';

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderAnimals();
        });
        pageNumbers.appendChild(pageBtn);
    }
}

// Apply filters
function applyFilters() {
    currentFilters = {
        animalType: animalTypeFilter.value,
        breed: breedFilter.value,
        age: ageFilter.value,
        gender: genderFilter.value,
        size: sizeFilter.value,
        location: locationFilter.value,
        neutered: neuteredFilter.value,
        personality: personalityFilter.value,
        search: searchInput.value.toLowerCase()
    };

    filteredAnimals = animals.filter(animal => {
        // Type filter
        if (currentFilters.animalType && animal.type !== currentFilters.animalType) return false;

        // Breed filter
        if (currentFilters.breed) {
            const breedLower = animal.breed.toLowerCase();
            if (currentFilters.breed === 'mixed' && !breedLower.includes('mixed')) return false;
            // Note: More complex logic might be needed for specific breeds if backend data varies
        }

        // Age filter
        if (currentFilters.age && animal.ageCategory !== currentFilters.age) return false;

        // Gender filter
        if (currentFilters.gender && animal.gender !== currentFilters.gender) return false;

        // Size filter
        if (currentFilters.size && animal.size !== currentFilters.size) return false;

        // Location filter
        if (currentFilters.location && animal.location.toLowerCase() !== currentFilters.location) return false;

        // Neutered filter
        if (currentFilters.neutered) {
            const isNeutered = animal.neutered ? 'yes' : 'no';
            if (isNeutered !== currentFilters.neutered) return false;
        }

        // Personality filter
        if (currentFilters.personality && !animal.personality.includes(currentFilters.personality)) return false;

        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search;
            const searchableText = `
                ${animal.name} 
                ${animal.breed} 
                ${animal.type} 
                ${animal.location} 
                ${animal.personality.join(' ')}
                ${animal.story}
            `.toLowerCase();

            if (!searchableText.includes(searchTerm)) return false;
        }

        return true;
    });

    if (!ApiService.isAdmin()) {
        filteredAnimals = filteredAnimals.filter(animal =>
            ['AVAILABLE', 'Available', 'RESERVED', 'Reserved', 'ADOPTED', 'Adopted'].includes(animal.status)
        );
    }

    currentPage = 1;
    renderAnimals();
    updateStats();
}

// Reset all filters
function resetFilters() {
    animalTypeFilter.value = '';
    breedFilter.value = '';
    ageFilter.value = '';
    genderFilter.value = '';
    sizeFilter.value = '';
    locationFilter.value = '';
    neuteredFilter.value = '';
    personalityFilter.value = '';
    searchInput.value = '';

    applyFilters();
}

// Show animal details modal
function showAnimalDetails(animalId) {
    // Direct comparison of IDs, removed parseInt because MongoDB ID is a string
    const animal = animals.find(a => a.id === animalId);

    if (!animal) return;

    animalDetailHeader.innerHTML = `<img src="${animal.image}" alt="${animal.name}" onerror="this.src='${getDefaultAnimalImage(animal.type)}'">`;

    animalDetailBody.innerHTML = `
        <div class="animal-detail-title">
            <div>
                <h2>${animal.name}</h2>
                <p>${animal.breed} • ${animal.age} • ${animal.gender === 'male' ? 'Male' : 'Female'}</p>
            </div>
        </div>
        
        <div class="detail-row">
            <div class="detail-col">
                <div class="detail-group">
                    <div class="detail-label">Size</div>
                    <div class="detail-value">${animal.size.charAt(0).toUpperCase() + animal.size.slice(1)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${animal.location}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Neutered/Spayed</div>
                    <div class="detail-value">${animal.neutered ? 'Yes' : 'No'}</div>
                </div>
            </div>
            <div class="detail-col">
                <div class="detail-group">
                    <div class="detail-label">Personality Traits</div>
                    <div class="personality-detail">
                        ${animal.personalityTags.map(tag => `<span class="personality-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="animal-story">
            <h3>${animal.name}'s Story</h3>
            <p>${animal.story}</p>
        </div>
        
        <div style="margin-top: 30px; display: flex; gap: 15px;">
            <button class="btn btn-primary" id="adoptThisAnimal" style="flex: 2;">
                <i class="fas fa-heart"></i> Adopt ${animal.name}
            </button>
            <button class="btn btn-outline" id="shareAnimal" style="flex: 1;">
                <i class="fas fa-share-alt"></i> Share
            </button>
        </div>
    `;

    animalDetailModal.classList.add('active');

    document.getElementById('adoptThisAnimal').addEventListener('click', () => {
        startAdoptionProcess(animal.id);
    });

    document.getElementById('shareAnimal').addEventListener('click', () => {
        shareAnimal(animal);
    });
}


// Show edit modal
function showEditModal(animal) {
    currentEditingAnimal = animal;

    // 如果模态框已存在，先重置按钮状态
    const existingSubmitBtn = document.querySelector('#editAnimalForm button[type="submit"]');
    if (existingSubmitBtn) {
        existingSubmitBtn.innerHTML = 'Save Changes';
        existingSubmitBtn.disabled = false;
    }

    // Create edit modal if it doesn't exist
    if (!editModal) {
        editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.id = 'editModal';
        editModal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close-modal" id="closeEditModal">&times;</span>
                <h2>Edit Animal: ${animal.name}</h2>
                <form id="editAnimalForm">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="editName">Name *</label>
                            <input type="text" id="editName" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="editType">Type *</label>
                            <select id="editType" class="form-control" required>
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editBreed">Breed</label>
                            <input type="text" id="editBreed" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="editAge">Age</label>
                            <input type="text" id="editAge" class="form-control" placeholder="e.g., 2 years, 6 months">
                        </div>
                        <div class="form-group">
                            <label for="editGender">Gender</label>
                            <select id="editGender" class="form-control">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editSize">Size</label>
                            <select id="editSize" class="form-control">
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editLocation">Location</label>
                            <input type="text" id="editLocation" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="editNeutered">Neutered/Spayed</label>
                            <select id="editNeutered" class="form-control">
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editStatus">Status</label>
                            <select id="editStatus" class="form-control">
                                <option value="AVAILABLE">Available</option>
                                <option value="RESERVED">Reserved</option>
                                <option value="ADOPTED">Adopted</option>
                            </select>
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label for="editImage">Image URL</label>
                            <input type="text" id="editImage" class="form-control">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label for="editPersonality">Personality (comma-separated)</label>
                            <input type="text" id="editPersonality" class="form-control" placeholder="e.g., Friendly, Playful, Calm">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label for="editStory">Story</label>
                            <textarea id="editStory" class="form-control" rows="4"></textarea>
                        </div>
                    </div>
                    <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline" id="cancelEdit">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(editModal);

        // Add event listeners
        editModal.querySelector('#closeEditModal').addEventListener('click', () => {
            editModal.classList.remove('active');
        });

        editModal.querySelector('#cancelEdit').addEventListener('click', () => {
            editModal.classList.remove('active');
        });

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.classList.remove('active');
            }
        });

        document.getElementById('editAnimalForm').addEventListener('submit', handleEditSubmit);
    }

    // Populate form with current data
    document.getElementById('editName').value = animal.name;
    document.getElementById('editType').value = animal.rawType || animal.type;
    document.getElementById('editBreed').value = animal.breed;
    document.getElementById('editAge').value = animal.age;
    document.getElementById('editGender').value = animal.gender;
    document.getElementById('editSize').value = animal.size;
    document.getElementById('editLocation').value = animal.location;
    document.getElementById('editNeutered').value = animal.neutered.toString();
    document.getElementById('editStatus').value = animal.status;
    document.getElementById('editImage').value = animal.image;
    document.getElementById('editPersonality').value = animal.personality.join(', ');
    document.getElementById('editStory').value = animal.story;

    // Show modal
    editModal.classList.add('active');
}


// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();

    if (!currentEditingAnimal) return;

    const formData = {
        name: document.getElementById('editName').value,
        type: document.getElementById('editType').value,
        breed: document.getElementById('editBreed').value,
        age: document.getElementById('editAge').value,
        gender: document.getElementById('editGender').value,
        location: document.getElementById('editLocation').value,
        size: document.getElementById('editSize').value,
        neutered: document.getElementById('editNeutered').value === 'true',
        status: document.getElementById('editStatus').value,
        image: document.getElementById('editImage').value,
        story: document.getElementById('editStory').value,
        personality: document.getElementById('editPersonality').value
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0)
    };

    try {
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        // Call API to update
        const result = await ApiService.updateAnimal(currentEditingAnimal.id, formData);

        // Show success message
        showToast('Animal updated successfully!', 'success');

        // Close modal
        editModal.classList.remove('active');


        // Refresh data from backend
        await fetchAnimals();
        // Reapply filters to update display
        applyFilters();

        // 如果之前正在查看这个动物的详情，重新打开详情模态框
        if (animalDetailModal.classList.contains('active')) {
            showAnimalDetails(currentEditingAnimal.id);
        }

        // 重置编辑状态
        currentEditingAnimal = null;


    } catch (error) {
        console.error('Error updating animal:', error);
        showToast(`Update failed: ${error.message}`, 'error');
    } finally {
        // 确保按钮状态被重置，即使发生错误也要执行
        try {
            const submitBtn = document.querySelector('#editAnimalForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = 'Save Changes';
                submitBtn.disabled = false;
            }
        } catch (e) {
            console.log('Error resetting button:', e);
        }
    }
}


// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer;">×</button>
    `;

    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);

    // Add animation styles if not present
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

// 跳转到动物所在的页码
function jumpToAnimalPage(animalId) {
    // 在过滤后的动物列表中查找该动物
    const animalIndex = filteredAnimals.findIndex(animal => animal.id === animalId);

    if (animalIndex === -1) {
        console.log(`Animal ${animalId} not found in filtered list`);
        return;
    }

    // 计算该动物所在的页码
    const targetPage = Math.floor(animalIndex / animalsPerPage) + 1;

    // 如果当前不在该页，跳转到该页
    if (currentPage !== targetPage) {
        currentPage = targetPage;
        renderAnimals();

        // 高亮显示该动物卡片
        highlightAnimalCard(animalId);
    } else {
        // 如果已经在当前页，直接高亮
        highlightAnimalCard(animalId);
    }
}

// 高亮显示动物卡片
function highlightAnimalCard(animalId) {
    // 移除之前的高亮
    document.querySelectorAll('.animal-card').forEach(card => {
        card.classList.remove('highlighted');
    });

    // 添加高亮
    const targetCard = document.querySelector(`.animal-card [data-id="${animalId}"]`)?.closest('.animal-card');
    if (targetCard) {
        targetCard.classList.add('highlighted');

        // 添加CSS高亮样式
        if (!document.getElementById('animal-highlight-style')) {
            const style = document.createElement('style');
            style.id = 'animal-highlight-style';
            style.textContent = `
                .animal-card.highlighted {
                    border: 3px solid var(--accent-color);
                    box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
                }
            `;
            document.head.appendChild(style);
        }

        // 滚动到该卡片位置
        setTimeout(() => {
            targetCard.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);
    }
}

// Start adoption process
function startAdoptionProcess(animalId) {
    if (!currentUser) {
        showToast('Please login or register to start the adoption process.', 'warning');
        animalDetailModal.classList.remove('active');
        setTimeout(() => {
            loginModal.classList.add('active');
        }, 300);
        return;
    }

    // Add real adoption application API call here
    showToast(`Adoption request for animal ID: ${animalId} started!`, 'success');
}

// Share animal
function shareAnimal(animal) {
    if (navigator.share) {
        navigator.share({
            title: `Adopt ${animal.name}`,
            text: `Check out ${animal.name}, a ${animal.age} ${animal.breed} available for adoption!`,
            url: window.location.href
        });
    } else {
        const shareText = `Check out ${animal.name}, a ${animal.age} ${animal.breed} available for adoption!`;
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Link copied to clipboard!', 'success');
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter change events
    const filterElements = [
        animalTypeFilter, breedFilter, ageFilter, genderFilter,
        sizeFilter, locationFilter, neuteredFilter, personalityFilter
    ];

    filterElements.forEach(filter => {
        if(filter) filter.addEventListener('change', applyFilters);
    });

    // Search button
    if(searchBtn) searchBtn.addEventListener('click', applyFilters);

    // Search input enter key
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') applyFilters();
        });
    }

    // Reset buttons
    if(resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
    if(resetEmptyBtn) resetEmptyBtn.addEventListener('click', resetFilters);

    // Pagination buttons
    if(prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderAnimals();
            }
        });
    }

    if(nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredAnimals.length / animalsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderAnimals();
            }
        });
    }

    // Modal events
    if(closeAnimalModal) {
        closeAnimalModal.addEventListener('click', () => {
            animalDetailModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === animalDetailModal) {
            animalDetailModal.classList.remove('active');
        }
    });

    // Delegate events for animal cards (since they're dynamically created)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.view-detail-btn')) {
            const animalId = e.target.closest('.view-detail-btn').getAttribute('data-id');

            // 如果是 admin，直接打开编辑模态框
            if (ApiService.isAdmin()) {
                const animal = animals.find(a => a.id === animalId);
                if (animal) {
                    showEditModal(animal);
                }
            } else {
                // 普通用户打开详情模态框
                showAnimalDetails(animalId);
            }
        }

        if (e.target.closest('.adopt-btn')) {
            const animalId = e.target.closest('.adopt-btn').getAttribute('data-id');
            startAdoptionProcess(animalId);
        }
    });

    // Auth Event Listeners (FIXED)
    // Modal Toggles
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (currentUser) {
                // 如果是登录状态，跳转到用户页面或其他操作
                window.location.href = 'my-account.html';
            } else {
                loginModal.classList.add('active');
            }
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            if (currentUser) {
                logout();
            } else {
                registerModal.classList.add('active');
            }
        });
    }
    // Modal Toggles
    //if (loginBtn) loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    //if (registerBtn && !currentUser) registerBtn.addEventListener('click', () => registerModal.classList.add('active'));

    if (closeLoginModal) closeLoginModal.addEventListener('click', () => loginModal.classList.remove('active'));
    if (closeRegisterModal) closeRegisterModal.addEventListener('click', () => registerModal.classList.remove('active'));

    // Auth Event Listeners
    if (loginForm) {
        loginForm.removeEventListener('submit', handleLogin);
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.removeEventListener('submit', handleRegister);
        registerForm.addEventListener('submit', handleRegister);
    }

// 切换登录/注册模态框
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.remove('active');
            registerModal.classList.add('active');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.classList.remove('active');
            loginModal.classList.add('active');
        });
    }

    // Close auth modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.remove('active');
        if (e.target === registerModal) registerModal.classList.remove('active');
    });
}

// UI Helper: Show Button Loading
function showButtonLoading(button) {
    if (!button) return;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
}

// UI Helper: Hide Button Loading
function hideButtonLoading(button) {
    if (!button || !button.dataset.originalText) return;
    button.innerHTML = button.dataset.originalText;
    button.disabled = false;
    delete button.dataset.originalText;
}

// UI Helper: Show Toast
function showToast(message, type = 'info') {
    // Remove existing
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    // Simple styling if CSS missing
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white; padding: 15px 20px; border-radius: 5px; z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
    `;

    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> 
        <span style="margin-left: 10px">${message}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', initPage);