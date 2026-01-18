// ============== CONFIGURATION ==============
const CONFIG = {
    apiBase: '/api',
    itemsPerPage: 12,
    defaultImage: 'https://www.svgrepo.com/show/475529/cinema.svg'
};

// ============== API CLIENT SIMPLE ==============
const API = {
    // Melolo API (yang sudah dipakai)
    melolo: {
        home: async (offset = 0, count = 12) => {
            const response = await fetch(`${CONFIG.apiBase}/home?offset=${offset}&count=${count}&lang=id`);
            return response.json();
        }
    },
    
    // ShortMax API (tambahan baru)
    shortmax: {
        home: async () => {
            try {
                const response = await fetch('https://dramabos.asia/api/shortmax/api/v1/home?lang=id');
                const data = await response.json();
                return { code: 0, data: data.data || [] };
            } catch (error) {
                return { code: -1, error: error.message, data: [] };
            }
        }
    },
    
    // FlickReels API (tambahan baru)
    flickreels: {
        home: async (page = 1) => {
            try {
                const response = await fetch(`https://dramabos.asia/api/flick/home?page=${page}&page_size=20&lang=6`);
                const data = await response.json();
                return { code: 0, data: data.list || [] };
            } catch (error) {
                return { code: -1, error: error.message, data: [] };
            }
        }
    }
};

// Simple cache system
const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 menit

async function fetchWithCache(apiCall, cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    const data = await apiCall();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

// ============== STATE VARIABLES ==============
let currentOffset = 0;
let isLoading = false;
let hasMoreData = true;
let currentView = 'grid'; // 'grid' atau 'list'
let currentSource = 'melolo'; // 'melolo', 'shortmax', 'flickreels'
let currentPage = 1; // Untuk API yang pakai page bukan offset

// ============== DOM ELEMENTS ==============
const elements = {
    dramaList: document.getElementById('drama-list'),
    loadMoreBtn: document.getElementById('load-more'),
    loadingIndicator: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state'),
    sourceSelector: null // Akan diinisialisasi nanti
};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', function() {
    console.log('DramaShort Enhanced initialized');
    
    // Load saved preferences
    const savedView = localStorage.getItem('dramashort_view');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
        currentView = savedView;
        updateView();
    }
    
    const savedSource = localStorage.getItem('dramashort_source');
    if (savedSource && ['melolo', 'shortmax', 'flickreels'].includes(savedSource)) {
        currentSource = savedSource;
    }
    
    // Initialize UI components
    initializeSourceSelector();
    initializeViewToggle();
    addScrollToTopButton();
    
    // Load initial dramas
    loadDramas();
    
    // Setup load more button
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', function() {
            if (!isLoading && hasMoreData) {
                loadDramas(currentOffset);
            }
        });
    }
});

// ============== SOURCE SELECTOR FUNCTIONS ==============

/**
 * Initialize source selector dropdown
 */
function initializeSourceSelector() {
    const header = document.querySelector('.d-flex.justify-content-between');
    if (!header) return;
    
    // Create selector HTML
    const selectorHTML = `
        <select id="source-selector" class="form-select form-select-sm source-selector">
            <option value="melolo" ${currentSource === 'melolo' ? 'selected' : ''}>🎬 Melolo</option>
            <option value="shortmax" ${currentSource === 'shortmax' ? 'selected' : ''}>⚡ ShortMax</option>
            <option value="flickreels" ${currentSource === 'flickreels' ? 'selected' : ''}>🔥 FlickReels</option>
        </select>
    `;
    
    // Insert selector before view toggle buttons
    const buttonContainer = header.querySelector('.d-flex');
    buttonContainer.insertAdjacentHTML('afterbegin', selectorHTML);
    
    // Store reference
    elements.sourceSelector = document.getElementById('source-selector');
    
    // Add event listener
    elements.sourceSelector.addEventListener('change', async function() {
        currentSource = this.value;
        currentOffset = 0;
        currentPage = 1;
        
        // Save preference
        localStorage.setItem('dramashort_source', currentSource);
        
        // Clear cache for new source
        cache.clear();
        
        // Reload dramas
        await loadDramas(0);
        
        // Update page title based on source
        updatePageTitle();
    });
}

/**
 * Update page title based on current source
 */
function updatePageTitle() {
    const titles = {
        melolo: 'DramaShort - Streaming Drama Asia',
        shortmax: 'ShortMax - Drama Pendek Terbaik',
        flickreels: 'FlickReels - Drama Trending'
    };
    
    if (titles[currentSource]) {
        document.title = titles[currentSource];
    }
}

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
    // Cek jika button sudah ada
    if (document.getElementById('scroll-to-top')) return;
    
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
 * Load dramas from selected API source
 */
async function loadDramas(offset = 0) {
    if (isLoading) return;
    
    isLoading = true;
    showLoading(true);
    
    try {
        let result;
        const cacheKey = `${currentSource}_${offset}_${currentPage}`;
        
        // Gunakan cache jika ada
        if (cache.has(cacheKey)) {
            result = cache.get(cacheKey).data;
        } else {
            // Pilih API berdasarkan source
            switch(currentSource) {
                case 'shortmax':
                    result = await API.shortmax.home();
                    break;
                    
                case 'flickreels':
                    result = await API.flickreels.home(currentPage);
                    break;
                    
                case 'melolo':
                default:
                    result = await API.melolo.home(offset, CONFIG.itemsPerPage);
                    break;
            }
            
            // Simpan ke cache
            cache.set(cacheKey, { data: result, timestamp: Date.now() });
        }
        
        // Process response
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
            if (offset === 0) {
                elements.dramaList.innerHTML = '';
            }
            
            if (result.data.length > 0) {
                renderDramas(result.data);
                
                // Update pagination state berdasarkan source
                if (currentSource === 'melolo') {
                    currentOffset = offset + result.data.length;
                    hasMoreData = result.has_more || (result.data.length >= CONFIG.itemsPerPage);
                } else if (currentSource === 'flickreels') {
                    currentPage++;
                    hasMoreData = result.data.length >= 20; // flickreels selalu 20 per page
                } else {
                    // shortmax cuma 1 page
                    hasMoreData = false;
                }
                
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
                    showEmptyState(`No dramas found in ${currentSource}. Try another source.`);
                }
                hasMoreData = false;
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.style.display = 'none';
                }
            }
        } else {
            throw new Error(`Invalid API response from ${currentSource}`);
        }
    } catch (error) {
        console.error(`Error loading dramas from ${currentSource}:`, error);
        
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
 * Render dramas to the grid/list with source-specific formatting
 */
function renderDramas(dramas) {
    if (!dramas || !Array.isArray(dramas) || dramas.length === 0) {
        return;
    }
    
    const dramasHtml = dramas.map(drama => {
        // Format data berbeda untuk setiap source
        let title, author, intro, episodes, cover, dramaId, videoUrl;
        
        switch(currentSource) {
            case 'shortmax':
                title = drama.name || drama.title || 'Untitled Short';
                author = drama.author || 'Unknown';
                intro = drama.intro || drama.description || 'No description available.';
                episodes = 1; // ShortMax biasanya single episode
                cover = drama.cover || drama.thumbnail || CONFIG.defaultImage;
                dramaId = drama.id || drama._id;
                videoUrl = drama.video_url || `#`;
                break;
                
            case 'flickreels':
                title = drama.drama_name || drama.title || 'Untitled Drama';
                author = drama.author || 'Unknown';
                intro = drama.description || 'No description available.';
                episodes = drama.total_episodes || 0;
                cover = drama.vertical_cover || drama.cover || CONFIG.defaultImage;
                dramaId = drama.drama_id || drama.id;
                videoUrl = `https://dramabos.asia/api/flick/drama/${dramaId}?lang=6`;
                break;
                
            case 'melolo':
            default:
                title = drama.name || 'Untitled Drama';
                author = drama.author || 'Unknown Author';
                intro = drama.intro || 'No description available.';
                episodes = drama.episodes || 0;
                cover = drama.cover || CONFIG.defaultImage;
                dramaId = drama.id;
                videoUrl = `/drama.html?id=${dramaId}`;
                break;
        }
        
        // Escape untuk keamanan
        title = escapeHtml(title);
        author = escapeHtml(author);
        intro = escapeHtml(intro.length > 80 ? intro.substring(0, 80) + '...' : intro);
        
        // Different HTML for list view
        if (currentView === 'list') {
            return `
                <div class="col">
                    <div class="drama-card">
                        <!-- Cover Image -->
                        <div class="card-cover">
                            <img src="${cover}" 
                                 class="drama-cover"
                                 alt="${title}"
                                 loading="lazy"
                                 onerror="this.src='${CONFIG.defaultImage}'">
                            
                            <!-- Episode Badge -->
                            ${episodes > 0 ? `
                            <div class="episode-badge">
                                ${episodes} ${currentSource === 'shortmax' ? 'SHORT' : 'EP'}
                            </div>
                            ` : ''}
                            
                            <!-- Play Overlay -->
                            <div class="play-overlay">
                                <a href="${videoUrl}" class="play-btn" ${currentSource === 'shortmax' ? 'target="_blank"' : ''}>
                                    <i class="bi bi-play-fill"></i>
                                </a>
                            </div>
                        </div>
                        
                        <!-- Card Content -->
                        <div class="card-body">
                            <h6 class="drama-title">${title}</h6>
                            <div class="drama-meta">
                                <small><i class="bi bi-person"></i> ${author}</small>
                                ${episodes > 0 ? `<small class="ms-3"><i class="bi bi-film"></i> ${episodes} ${currentSource === 'shortmax' ? 'Short' : 'Ep'}</small>` : ''}
                                <small class="ms-3"><i class="bi bi-database"></i> ${currentSource.toUpperCase()}</small>
                            </div>
                            <p class="drama-desc">${intro}</p>
                            
                            <!-- Action Buttons -->
                            <div class="d-flex gap-2">
                                <a href="${videoUrl}" class="btn btn-primary btn-sm" ${currentSource === 'shortmax' ? 'target="_blank"' : ''}>
                                    <i class="bi bi-eye me-1"></i> ${currentSource === 'shortmax' ? 'Watch Now' : 'View Details'}
                                </a>
                                <button class="btn btn-outline-secondary btn-sm" onclick="addToFavorites('${dramaId}', '${currentSource}')">
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
                            <img src="${cover}" 
                                 class="drama-cover"
                                 alt="${title}"
                                 loading="lazy"
                                 onerror="this.src='${CONFIG.defaultImage}'">
                            
                            <!-- Episode Badge -->
                            ${episodes > 0 ? `
                            <div class="episode-badge">
                                ${episodes} ${currentSource === 'shortmax' ? 'SHORT' : 'EP'}
                            </div>
                            ` : ''}
                            
                            <!-- Source Badge -->
                            <div class="source-badge" style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 600;">
                                ${currentSource === 'shortmax' ? '⚡' : currentSource === 'flickreels' ? '🔥' : '🎬'} ${currentSource.toUpperCase()}
                            </div>
                            
                            <!-- Play Overlay -->
                            <div class="play-overlay">
                                <a href="${videoUrl}" class="play-btn" ${currentSource === 'shortmax' ? 'target="_blank"' : ''}>
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
                            <a href="${videoUrl}" class="btn btn-primary btn-sm w-100" ${currentSource === 'shortmax' ? 'target="_blank"' : ''}>
                                <i class="bi bi-eye me-1"></i> ${currentSource === 'shortmax' ? 'Watch Short' : 'Watch Now'}
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
    
    if (elements.loadMoreBtn) {
        if (show) {
            elements.loadMoreBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status"></span>
                Loading ${currentSource}...
            `;
            elements.loadMoreBtn.disabled = true;
        } else {
            elements.loadMoreBtn.innerHTML = `
                <i class="bi bi-plus-circle"></i> Load More ${currentSource === 'shortmax' ? 'Shorts' : 'Dramas'}
            `;
            elements.loadMoreBtn.disabled = false;
        }
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
                <p class="text-muted">Try switching to another source</p>
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
                    <strong>Error loading from ${currentSource}:</strong> ${escapeHtml(message)}
                    <div class="mt-2">
                        <button onclick="switchSource('melolo')" class="btn btn-sm btn-outline-primary me-2">
                            Switch to Melolo
                        </button>
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
 * Add to favorites with source info
 */
function addToFavorites(dramaId, source) {
    const favorites = JSON.parse(localStorage.getItem('dramashort_favorites') || '[]');
    const newFavorite = { id: dramaId, source, addedAt: new Date().toISOString() };
    
    // Cek jika sudah ada
    const exists = favorites.find(fav => fav.id === dramaId && fav.source === source);
    if (!exists) {
        favorites.push(newFavorite);
        localStorage.setItem('dramashort_favorites', JSON.stringify(favorites));
        
        // Show notification
        showNotification(`Added to favorites! (${source})`);
    } else {
        showNotification('Already in favorites!');
    }
}

/**
 * Show temporary notification
 */
function showNotification(message) {
    // Remove existing notification
    const existing = document.getElementById('temp-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'temp-notification';
    notification.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" style="position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="bi bi-check-circle me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

/**
 * Switch source programmatically
 */
function switchSource(source) {
    if (elements.sourceSelector && ['melolo', 'shortmax', 'flickreels'].includes(source)) {
        elements.sourceSelector.value = source;
        elements.sourceSelector.dispatchEvent(new Event('change'));
    }
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============== GLOBAL EXPORTS ==============
window.loadDramas = loadDramas;
window.addToFavorites = addToFavorites;
window.switchSource = switchSource;
