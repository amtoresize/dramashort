// ============== CONFIGURATION ==============
const CONFIG = {
    apiBase: '/api',
    itemsPerPage: 12,
    defaultImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzIyMiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg=='
};

// ============== STATE VARIABLES ==============
let currentOffset = 0;
let isLoading = false;
let hasMoreData = true;

// ============== DOM ELEMENTS ==============
const elements = {
    dramaList: document.getElementById('drama-list'),
    loadMoreBtn: document.getElementById('load-more'),
    loadingIndicator: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state')
};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DramaShort initialized');
    
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
    
    // Setup search if exists
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
});

// ============== MAIN FUNCTIONS ==============

/**
 * Load dramas from API
 */
async function loadDramas(offset = 0) {
    if (isLoading) {
        console.log('Already loading, skipping...');
        return;
    }
    
    isLoading = true;
    showLoading(true);
    
    try {
        console.log('Loading dramas from offset:', offset);
        
        const apiUrl = `${CONFIG.apiBase}/home?offset=${offset}&count=${CONFIG.itemsPerPage}&lang=id`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.code === 0 && data.data && Array.isArray(data.data)) {
            if (offset === 0) {
                // First load, clear existing content
                elements.dramaList.innerHTML = '';
            }
            
            if (data.data.length > 0) {
                renderDramas(data.data);
                currentOffset = data.next_offset || offset + data.data.length;
                hasMoreData = data.has_more || false;
                
                // Show/hide load more button
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.style.display = hasMoreData ? 'block' : 'none';
                    elements.loadMoreBtn.textContent = hasMoreData ? 
                        `Load More (${currentOffset}+)` : 'All Dramas Loaded';
                }
                
                // Hide empty state
                if (elements.emptyState) {
                    elements.emptyState.style.display = 'none';
                }
            } else {
                // No data returned
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
        } else {
            alert(`Failed to load more dramas: ${error.message}`);
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
 * Render dramas to the grid
 */
function renderDramas(dramas) {
    if (!dramas || !Array.isArray(dramas) || dramas.length === 0) {
        console.warn('No dramas to render');
        return;
    }
    
    console.log(`Rendering ${dramas.length} dramas`);
    
    const dramasHtml = dramas.map(drama => {
        // Sanitize data
        const title = escapeHtml(drama.name || 'Untitled Drama');
        const author = escapeHtml(drama.author || 'Unknown Author');
        const intro = escapeHtml((drama.intro || 'No description available.').substring(0, 100) + '...');
        const episodes = drama.episodes || 0;
        
        return `
            <div class="col">
                <div class="drama-card h-100">
                    <div class="position-relative overflow-hidden rounded-top">
                        <img src="${drama.cover || CONFIG.defaultImage}" 
                             class="img-fluid drama-cover"
                             alt="${title}"
                             loading="lazy"
                             onerror="this.src='${CONFIG.defaultImage}'">
                        
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-primary">${episodes} EP</span>
                        </div>
                        
                        <div class="position-absolute bottom-0 start-0 end-0 p-3 overlay-gradient">
                            <div class="d-flex justify-content-between align-items-end">
                                <div>
                                    <small class="text-light opacity-75">
                                        <i class="bi bi-person"></i> ${author}
                                    </small>
                                </div>
                                <a href="/drama.html?id=${drama.id}" 
                                   class="btn btn-sm btn-primary rounded-circle">
                                    <i class="bi bi-play-fill"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <h6 class="drama-title mb-2">${title}</h6>
                        <p class="drama-description small text-muted mb-0">
                            ${intro}
                        </p>
                    </div>
                    
                    <div class="card-footer bg-transparent border-top-0 pt-0">
                        <a href="/drama.html?id=${drama.id}" 
                           class="btn btn-outline-primary w-100">
                            <i class="bi bi-eye me-1"></i> Watch Now
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    elements.dramaList.insertAdjacentHTML('beforeend', dramasHtml);
    
    // Add CSS if not exists
    addDramaCardStyles();
}

/**
 * Perform search
 */
async function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (!query) {
        loadDramas(0); // Reload all if empty
        return;
    }
    
    console.log('Searching for:', query);
    // Note: You'll need to implement search API endpoint
    alert('Search functionality coming soon!');
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
        elements.loadMoreBtn.innerHTML = 'Load More';
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
                        <button onclick="loadDramas(0)" class="btn btn-sm btn-primary ms-2">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
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

/**
 * Add drama card styles dynamically
 */
function addDramaCardStyles() {
    if (document.getElementById('drama-card-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'drama-card-styles';
    style.textContent = `
        .drama-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
            height: 100%;
        }
        
        .drama-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
            border-color: #0d6efd;
        }
        
        .drama-cover {
            width: 100%;
            height: 280px;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .drama-card:hover .drama-cover {
            transform: scale(1.05);
        }
        
        .drama-title {
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.8em;
            color: #fff;
        }
        
        .drama-description {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.8em;
        }
        
        .overlay-gradient {
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
        }
        
        @media (max-width: 768px) {
            .drama-cover {
                height: 220px;
            }
            
            .drama-title {
                font-size: 0.9rem;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ============== GLOBAL EXPORTS ==============
window.loadDramas = loadDramas;
window.performSearch = performSearch;
