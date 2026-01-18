// ============== CONFIGURATION ==============
const CONFIG = {
    apiBase: '/api',
    itemsPerPage: 12,
    defaultImage: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=500&fit=crop&auto=format'
};

// ============== STATE VARIABLES ==============
let currentOffset = 0;
let isLoading = false;
let hasMoreData = true;
let currentView = 'grid'; // 'grid' atau 'list'

// ============== DOM ELEMENTS ==============
const elements = {
    dramaList: document.getElementById('drama-list'),
    loadMoreBtn: document.getElementById('load-more'),
    loadingIndicator: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state')
};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DramaShort Home initialized');
    
    // Load saved view preference
    const savedView = localStorage.getItem('dramashort_view');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
        currentView = savedView;
        updateView();
    }
    
    // Load initial dramas
    loadDramas();
    
    // Setup event listeners
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', function() {
            if (!isLoading && hasMoreData) {
                loadDramas(currentOffset);
            }
        });
    }
    
    // Initialize view toggle
    initializeViewToggle();
    
    // Add scroll to top button
    addScrollToTopButton();
});

// ============== VIEW TOGGLE FUNCTIONS ==============

/**
 * Initialize view toggle buttons
 */
function initializeViewToggle() {
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    
    if (!gridBtn || !listBtn) return;
    
    // Set initial button state
    updateViewButtons();
    
    // Grid button click
    gridBtn.addEventListener('click', () => {
        if (currentView !== 'grid') {
            currentView = 'grid';
            updateView();
        }
    });
    
    // List button click
    listBtn.addEventListener('click', () => {
        if (currentView !== 'list') {
            currentView = 'list';
            updateView();
        }
    });
}

/**
 * Update view buttons state
 */
function updateViewButtons() {
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    
    if (gridBtn && listBtn) {
        if (currentView === 'grid') {
            gridBtn.classList.remove('btn-outline-secondary');
            gridBtn.classList.add('btn-primary');
            listBtn.classList.remove('btn-primary');
            listBtn.classList.add('btn-outline-secondary');
        } else {
            listBtn.classList.remove('btn-outline-secondary');
            listBtn.classList.add('btn-primary');
            gridBtn.classList.remove('btn-primary');
            gridBtn.classList.add('btn-outline-secondary');
        }
    }
}

/**
 * Update the view layout
 */
function updateView() {
    const dramaList = elements.dramaList;
    if (!dramaList) return;
    
    // Toggle CSS class
    if (currentView === 'list') {
        dramaList.classList.add('list-view');
        dramaList.classList.remove('row-cols-2', 'row-cols-md-3', 'row-cols-lg-4', 'row-cols-xl-5', 'g-4');
        dramaList.classList.add('row-cols-1', 'g-3');
    } else {
        dramaList.classList.remove('list-view');
        dramaList.classList.remove('row-cols-1', 'g-3');
        dramaList.classList.add('row-cols-2', 'row-cols-md-3', 'row-cols-lg-4', 'row-cols-xl-5', 'g-4');
    }
    
    // Update buttons
    updateViewButtons();
    
    // Save preference
    localStorage.setItem('dramashort_view', currentView);
}

/**
 * Add scroll to top button
 */
function addScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.className = 'btn btn-primary rounded-circle shadow';
    scrollBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        z-index: 1000;
        display: none;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(scrollBtn);
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
}

// ============== MAIN FUNCTIONS ==============

/**
 * Load dramas from API
 */
async function loadDramas(offset = 0) {
    if (isLoading) return;
    
    isLoading = true;
    showLoading(true);
    
    try {
        const apiUrl = `${CONFIG.apiBase}/home?offset=${offset}&count=${CONFIG.itemsPerPage}&lang=id`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.code === 0 && data.data && Array.isArray(data.data)) {
            if (offset === 0) {
                elements.dramaList.innerHTML = '';
            }
            
            if (data.data.length > 0) {
                renderDramas(data.data);
                currentOffset = data.next_offset || offset + data.data.length;
                hasMoreData = data.has_more || false;
                
                // Show/hide load more button
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.style.display = hasMoreData ? 'block' : 'none';
                }
                
                // Hide empty state
                if (elements.emptyState) {
                    elements.emptyState.style.display = 'none';
                }
            } else {
                if (offset === 0) {
                    showEmptyState('No dramas found. Try again later.');
                }
                hasMoreData = false;
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.style.display = 'none';
                }
            }
        } else {
            throw new Error('Invalid API response format');
        }
    } catch (error) {
        console.error('Error loading dramas:', error);
        
        if (offset === 0) {
            showError(`Failed to load dramas: ${error.message}`);
        }
        
        hasMoreData = false;
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.style.display = 'none';
        }
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

/**
 * Render dramas to the grid/list
 */
function renderDramas(dramas) {
    if (!dramas || !Array.isArray(dramas) || dramas.length === 0) {
        return;
    }
    
    const dramasHtml = dramas.map(drama => {
        const title = escapeHtml(drama.name || 'Untitled Drama');
        const author = escapeHtml(drama.author || 'Unknown Author');
        const intro = escapeHtml((drama.intro || 'No description.').substring(0, 80) + '...');
        const episodes = drama.episodes || 0;
        
        // Different HTML for list view
        if (currentView === 'list') {
            return `
                <div class="col">
                    <div class="drama-card">
                        <!-- Cover Image -->
                        <div class="card-cover">
                            <img src="${drama.cover || CONFIG.defaultImage}" 
                                 class="drama-cover"
                                 alt="${title}"
                                 loading="lazy"
                                 onerror="this.src='${CONFIG.defaultImage}'">
                            
                            <!-- Episode Badge -->
                            <div class="episode-badge">
                                ${episodes} EP
                            </div>
                            
                            <!-- Play Overlay -->
                            <div class="play-overlay">
                                <a href="/drama.html?id=${drama.id}" class="play-btn">
                                    <i class="bi bi-play-fill"></i>
                                </a>
                            </div>
                        </div>
                        
                        <!-- Card Content -->
                        <div class="card-body">
                            <h6 class="drama-title">${title}</h6>
                            <div class="drama-meta">
                                <small><i class="bi bi-person"></i> ${author}</small>
                                <small class="ms-3"><i class="bi bi-film"></i> ${episodes} Episode</small>
                            </div>
                            <p class="drama-desc">${escapeHtml(drama.intro || 'No description available.')}</p>
                            
                            <!-- Action Buttons -->
                            <div class="d-flex gap-2">
                                <a href="/drama.html?id=${drama.id}" class="btn btn-primary btn-sm">
                                    <i class="bi bi-eye me-1"></i> Watch Now
                                </a>
                                <button class="btn btn-outline-secondary btn-sm" onclick="addToFavorites('${drama.id}')">
                                    <i class="bi bi-bookmark"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Grid view HTML
            return `
                <div class="col">
                    <div class="drama-card">
                        <!-- Cover Image -->
                        <div class="card-cover">
                            <img src="${drama.cover || CONFIG.defaultImage}" 
                                 class="drama-cover"
                                 alt="${title}"
                                 loading="lazy"
                                 onerror="this.src='${CONFIG.defaultImage}'">
                            
                            <!-- Episode Badge -->
                            <div class="episode-badge">
                                ${episodes} EP
                            </div>
                            
                            <!-- Play Overlay -->
                            <div class="play-overlay">
                                <a href="/drama.html?id=${drama.id}" class="play-btn">
                                    <i class="bi bi-play-fill"></i>
                                </a>
                            </div>
                        </div>
                        
                        <!-- Card Content -->
                        <div class="card-body">
                            <h6 class="drama-title">${title}</h6>
                            <div class="drama-meta">
                                <small><i class="bi bi-person"></i> ${author}</small>
                            </div>
                            <p class="drama-desc">${intro}</p>
                            
                            <!-- Watch Now Button -->
                            <a href="/drama.html?id=${drama.id}" class="btn btn-primary btn-sm w-100">
                                <i class="bi bi-eye me-1"></i> Watch Now
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');
    
    elements.dramaList.insertAdjacentHTML('beforeend', dramasHtml);
    
    // Apply view-specific styles
    if (currentView === 'list') {
        updateView();
    }
}

// ============== UI HELPER FUNCTIONS ==============

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    if (elements.loadMoreBtn && show) {
        elements.loadMoreBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Loading...
        `;
        elements.loadMoreBtn.disabled = true;
    } else if (elements.loadMoreBtn && !show) {
        elements.loadMoreBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Load More Drama';
        elements.loadMoreBtn.disabled = false;
    }
}

/**
 * Show empty state message
 */
function showEmptyState(message = 'No dramas available.') {
    if (elements.emptyState) {
        elements.emptyState.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-emoji-frown display-1 text-muted"></i>
                <h4 class="mt-3">${escapeHtml(message)}</h4>
                <button onclick="location.reload()" class="btn btn-primary mt-3">
                    <i class="bi bi-arrow-clockwise"></i> Refresh Page
                </button>
            </div>
        `;
        elements.emptyState.style.display = 'block';
    }
    
    if (elements.dramaList) {
        elements.dramaList.innerHTML = '';
    }
}

/**
 * Show error message
 */
function showError(message) {
    if (elements.dramaList) {
        elements.dramaList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${escapeHtml(message)}
                    <div class="mt-2">
                        <button onclick="location.reload()" class="btn btn-sm btn-outline-danger">
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Add to favorites (placeholder function)
 */
function addToFavorites(dramaId) {
    console.log('Added to favorites:', dramaId);
    alert('Added to favorites!');
    // Implement actual favorite functionality here
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============== GLOBAL EXPORTS ==============
window.loadDramas = loadDramas;
window.addToFavorites = addToFavorites;
