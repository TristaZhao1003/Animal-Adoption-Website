// adoption.js - Version using ApiService to connect to the database

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

// Initialize page
async function initPage() {
    try {
        // Show loading state
        if (animalsGrid) {
            animalsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">Loading animals...</div>';
        }

        // 1. Fetch data from backend
        await fetchAnimals();

        // 2. Initialize filters
        filteredAnimals = [...animals];

        // 3. Render page
        renderAnimals();
        updateStats();
        setupEventListeners();

    } catch (error) {
        console.error("Failed to init adoption page:", error);
        if (animalsGrid) {
            animalsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Failed to load data. Please check backend connection.</div>';
        }
    }
}

// Fetch and process animal data from API
async function fetchAnimals() {
    try {
        // Call ApiService to get backend data
        const rawAnimals = await ApiService.getAvailableAnimals();

        // Map backend data to frontend format
        animals = rawAnimals.map(animal => {
            const age = animal.age || 'Unknown';
            return {
                id: animal.id, // Keep string ID (MongoDB ObjectId)
                name: animal.name,
                type: formatAnimalType(animal.type),
                breed: animal.breed || 'Mixed',
                age: age,
                ageCategory: calculateAgeCategory(age), // Calculate age category for filtering
                gender: formatGender(animal.gender),
                size: (animal.size || 'medium').toLowerCase(),
                location: animal.location || 'Unknown',
                personality: animal.personality || [],
                personalityTags: (animal.personality || []).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                status: animal.status,
                image: animal.image || getDefaultAnimalImage(animal.type),
                neutered: animal.neutered,
                story: animal.story || 'No story available.'
            };
        });
    } catch (error) {
        console.error('Error fetching animals:', error);
        animals = []; // Reset on error
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

    if (filteredAnimals.length === 0) {
        animalsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    animalsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Calculate pagination
    const totalPages = Math.ceil(filteredAnimals.length / animalsPerPage);
    const startIndex = (currentPage - 1) * animalsPerPage;
    const endIndex = Math.min(startIndex + animalsPerPage, filteredAnimals.length);
    const pageAnimals = filteredAnimals.slice(startIndex, endIndex);

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
    const animalCard = document.createElement('div');
    animalCard.className = 'animal-card';
    animalCard.innerHTML = `
        <img src="${animal.image}" alt="${animal.name}" class="animal-img" onerror="this.src='${getDefaultAnimalImage(animal.type)}'">
        <div class="animal-info">
            <h3>${animal.name}</h3>
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
                <button class="btn btn-primary btn-card view-detail-btn" data-id="${animal.id}">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
                <button class="btn btn-accent btn-card adopt-btn" data-id="${animal.id}">
                    <i class="fas fa-heart"></i> Adopt Me
                </button>
            </div>
        </div>
    `;

    return animalCard;
}

// Update statistics
function updateStats() {
    totalAnimalsEl.textContent = filteredAnimals.length;
    dogsCountEl.textContent = filteredAnimals.filter(a => a.type === 'dog').length;
    catsCountEl.textContent = filteredAnimals.filter(a => a.type === 'cat').length;
    otherCountEl.textContent = filteredAnimals.filter(a => a.type !== 'dog' && a.type !== 'cat').length;
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
    // Critical Change: Direct comparison of IDs, removed parseInt because MongoDB ID is a string
    const animal = animals.find(a => a.id === animalId);

    if (!animal) return;

    animalDetailHeader.innerHTML = `<img src="${animal.image}" alt="${animal.name}" onerror="this.src='${getDefaultAnimalImage(animal.type)}'">`;

    animalDetailBody.innerHTML = `
        <div class="animal-detail-title">
            <div>
                <h2>${animal.name}</h2>
                <p>${animal.breed} • ${animal.age} • ${animal.gender === 'male' ? 'Male' : 'Female'}</p>
            </div>
            <span class="edit-btn"> Edit </span>
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

// Start adoption process
function startAdoptionProcess(animalId) {
    const isLoggedIn = ApiService.isAuthenticated(); // Use ApiService to check login status

    if (!isLoggedIn) {
        alert('Please login or register to start the adoption process.');
        animalDetailModal.classList.remove('active');
        setTimeout(() => {
            document.getElementById('loginBtn').click();
        }, 300);
        return;
    }

    // Add real adoption application API call here
    alert(`Starting adoption process for animal ID: ${animalId}`);
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
            alert('Link copied to clipboard!');
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
        // Important: Removed parseInt as IDs are strings
        if (e.target.closest('.view-detail-btn')) {
            const animalId = e.target.closest('.view-detail-btn').getAttribute('data-id');
            showAnimalDetails(animalId);
        }

        if (e.target.closest('.adopt-btn')) {
            const animalId = e.target.closest('.adopt-btn').getAttribute('data-id');
            startAdoptionProcess(animalId);
        }
    });

    // Auth Modal Handlers (Simplified or reused logic)
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    if (loginBtn) loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    if (registerBtn) registerBtn.addEventListener('click', () => registerModal.classList.add('active'));
    if (closeLoginModal) closeLoginModal.addEventListener('click', () => loginModal.classList.remove('active'));
    if (closeRegisterModal) closeRegisterModal.addEventListener('click', () => registerModal.classList.remove('active'));

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

// Initialize page on load
document.addEventListener('DOMContentLoaded', initPage);