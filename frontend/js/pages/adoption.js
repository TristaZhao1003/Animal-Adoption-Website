// Animal Data - Only available animals
const animals = [
    {
        id: 1,
        name: "Buddy",
        type: "dog",
        breed: "Mixed Breed",
        age: "2 years",
        ageCategory: "young",
        gender: "male",
        size: "medium",
        location: "Beijing",
        personality: ["friendly", "active", "playful", "loyal"],
        personalityTags: ["Friendly", "Active", "Playful"],
        status: "available",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        neutered: true,
        story: "Buddy was found on a rainy day, shivering in a cardboard box. After our care, he has recovered and become a lively, friendly companion. He loves interacting with people and would be great for families with children."
    },
    
    {
        id: 3,
        name: "Shadow",
        type: "cat",
        breed: "Siamese",
        age: "6 months",
        ageCategory: "puppy",
        gender: "male",
        size: "small",
        location: "Shenzhen",
        personality: ["curious", "active", "playful", "smart"],
        personalityTags: ["Curious", "Active", "Playful"],
        status: "available",
        image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        neutered: false,
        story: "Shadow was found in a parking lot when he was very small. He's extremely curious and interested in everything around him. He loves playing with various toys and would suit a family with time to interact with him."
    },
    {
        id: 4,
        name: "Fluffy",
        type: "cat",
        breed: "Persian",
        age: "5 years",
        ageCategory: "adult",
        gender: "female",
        size: "small",
        location: "Hangzhou",
        personality: ["elegant", "calm", "gentle", "requires grooming"],
        personalityTags: ["Elegant", "Calm", "Gentle"],
        status: "available",
        image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        neutered: true,
        story: "Fluffy's previous owner had to give her up due to cat allergies. She is a very elegant Persian cat with a gentle, calm personality. She needs regular grooming and would be best for families with cat experience."
    },
    {
        id: 5,
        name: "Charlie",
        type: "dog",
        breed: "Golden Retriever",
        age: "3 years",
        ageCategory: "adult",
        gender: "male",
        size: "large",
        location: "Chengdu",
        personality: ["friendly", "patient", "good with kids", "intelligent"],
        personalityTags: ["Friendly", "Patient", "Good with Kids"],
        status: "available",
        image: "https://images.unsplash.com/photo-1568572933382-74d440642117?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        neutered: true,
        story: "Charlie was surrendered when his family moved overseas. He's incredibly friendly and great with children. He knows basic commands and loves playing fetch. He would make a wonderful family pet."
    },
    {
        id: 6,
        name: "Luna",
        type: "dog",
        breed: "Husky",
        age: "2 years",
        ageCategory: "young",
        gender: "female",
        size: "large",
        location: "Beijing",
        personality: ["energetic", "playful", "vocal", "needs exercise"],
        personalityTags: ["Energetic", "Playful", "Vocal"],
        status: "available",
        image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        neutered: true,
        story: "Luna was found as a stray. She's full of energy and loves to play. She would be perfect for an active family who can provide her with plenty of exercise and attention."
    },
    {
        id: 7,
        name: "Oliver",
        type: "cat",
        breed: "Maine Coon",
        age: "4 years",
        ageCategory: "adult",
        gender: "male",
        size: "large",
        location: "Guangzhou",
        personality: ["gentle", "friendly", "quiet", "large"],
        personalityTags: ["Gentle", "Friendly", "Quiet"],
        status: "available",
        image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        neutered: true,
        story: "Oliver is a gentle giant. He's a large Maine Coon with a heart to match. He's very friendly but also enjoys his quiet time. He gets along well with other cats."
    },
    {
        id: 8,
        name: "Rocky",
        type: "dog",
        breed: "Beagle",
        age: "1 year",
        ageCategory: "young",
        gender: "male",
        size: "medium",
        location: "Shanghai",
        personality: ["curious", "friendly", "energetic", "scent-driven"],
        personalityTags: ["Curious", "Friendly", "Energetic"],
        status: "available",
        image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        neutered: true,
        story: "Rocky was rescued from a neglectful situation. He's made amazing progress and is now a happy, curious beagle. He loves following scents and going for walks."
    }
];

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
function initPage() {
    // Initially show all available animals
    filteredAnimals = [...animals];
    
    // Render animals
    renderAnimals();
    updateStats();
    setupEventListeners();
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
        <img src="${animal.image}" alt="${animal.name}" class="animal-img">
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
    
    const dogs = filteredAnimals.filter(a => a.type === 'dog').length;
    const cats = filteredAnimals.filter(a => a.type === 'cat').length;
    const others = filteredAnimals.filter(a => a.type !== 'dog' && a.type !== 'cat').length;
    
    dogsCountEl.textContent = dogs;
    catsCountEl.textContent = cats;
    otherCountEl.textContent = others;
}

// Update pagination controls
function updatePagination(totalPages) {
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // Update previous button
    prevPageBtn.disabled = currentPage === 1;
    prevPageBtn.classList.toggle('disabled', currentPage === 1);
    
    // Update next button
    nextPageBtn.disabled = currentPage === totalPages;
    nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
    
    // Update page numbers
    pageNumbers.innerHTML = '';
    
    // Show up to 5 page buttons
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
        if (currentFilters.animalType && animal.type !== currentFilters.animalType) {
            return false;
        }
        
        // Breed filter (simplified)
        if (currentFilters.breed) {
            const breedLower = animal.breed.toLowerCase();
            if (currentFilters.breed === 'mixed' && !breedLower.includes('mixed') && !breedLower.includes('mutt')) {
                return false;
            }
        }
        
        // Age filter
        if (currentFilters.age && animal.ageCategory !== currentFilters.age) {
            return false;
        }
        
        // Gender filter
        if (currentFilters.gender && animal.gender !== currentFilters.gender) {
            return false;
        }
        
        // Size filter
        if (currentFilters.size && animal.size !== currentFilters.size) {
            return false;
        }
        
        // Location filter
        if (currentFilters.location && animal.location.toLowerCase() !== currentFilters.location) {
            return false;
        }
        
        // Neutered filter
        if (currentFilters.neutered) {
            const isNeutered = animal.neutered ? 'yes' : 'no';
            if (isNeutered !== currentFilters.neutered) {
                return false;
            }
        }
        
        // Personality filter
        if (currentFilters.personality && !animal.personality.includes(currentFilters.personality)) {
            return false;
        }
        
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
            
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
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
    const animal = animals.find(a => a.id === animalId);
    
    if (!animal) return;
    
    // Set header image
    animalDetailHeader.innerHTML = `<img src="${animal.image}" alt="${animal.name}">`;
    
    // Set body content
    animalDetailBody.innerHTML = `
        <div class="animal-detail-title">
            <div>
                <h2>${animal.name}</h2>
                <p>${animal.breed} • ${animal.age} • ${animal.gender === 'male' ? 'Male' : 'Female'}</p>
            </div>
            <span class="status status-available">Available for Adoption</span>
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
                <div class="detail-group">
                    <div class="detail-label">Good With</div>
                    <div class="detail-value">Children, Other Pets, Families</div>
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
    
    // Show modal
    animalDetailModal.classList.add('active');
    
    // Add event listeners for modal buttons
    document.getElementById('adoptThisAnimal').addEventListener('click', () => {
        startAdoptionProcess(animal.id);
    });
    
    document.getElementById('shareAnimal').addEventListener('click', () => {
        shareAnimal(animal);
    });
}

// Start adoption process
function startAdoptionProcess(animalId) {
    // Check if user is logged in
    const isLoggedIn = false; // This should come from your auth system
    
    if (!isLoggedIn) {
        alert('Please login or register to start the adoption process.');
        animalDetailModal.classList.remove('active');
        
        // Show login modal
        setTimeout(() => {
            document.getElementById('loginBtn').click();
        }, 300);
        return;
    }
    
    // If logged in, proceed with adoption
    alert('Starting adoption process. This would redirect to an adoption application form in a real application.');
    // window.location.href = `adoption-application.html?animalId=${animalId}`;
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
        // Fallback: copy to clipboard
        const shareText = `Check out ${animal.name}, a ${animal.age} ${animal.breed} available for adoption at Animal Adoption Center!`;
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
        filter.addEventListener('change', applyFilters);
    });
    
    // Search button
    searchBtn.addEventListener('click', applyFilters);
    
    // Search input enter key
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Reset filters buttons
    resetFiltersBtn.addEventListener('click', resetFilters);
    resetEmptyBtn.addEventListener('click', resetFilters);
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderAnimals();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredAnimals.length / animalsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderAnimals();
        }
    });
    
    // Animal detail modal close
    closeAnimalModal.addEventListener('click', () => {
        animalDetailModal.classList.remove('active');
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === animalDetailModal) {
            animalDetailModal.classList.remove('active');
        }
    });
    
    // Delegate events for animal cards (since they're dynamically created)
    document.addEventListener('click', (e) => {
        // View detail button
        if (e.target.closest('.view-detail-btn')) {
            const animalId = parseInt(e.target.closest('.view-detail-btn').getAttribute('data-id'));
            showAnimalDetails(animalId);
        }
        
        // Adopt button on card
        if (e.target.closest('.adopt-btn')) {
            const animalId = parseInt(e.target.closest('.adopt-btn').getAttribute('data-id'));
            startAdoptionProcess(animalId);
        }
    });
    
    // Login/Register modal functionality (simplified)
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            registerModal.classList.add('active');
        });
    }
    
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }
    
    if (closeRegisterModal) {
        closeRegisterModal.addEventListener('click', () => {
            registerModal.classList.remove('active');
        });
    }
    
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
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
        if (e.target === registerModal) {
            registerModal.classList.remove('active');
        }
    });
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', initPage);