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
});

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
 * Render dramas to the grid (FIXED HEIGHT CARDS)
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
        
        return `
            <div class="col">
                <div class="drama-card">
                    <!-- Cover Image (FIXED HEIGHT) -->
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
                    
                    <!-- Card Content (FIXED HEIGHT) -->
                    <div class="card-content">
                        <h6 class="drama-title">${title}</h6>
                        <div class="drama-meta">
                            <small><i class="bi bi-person"></i> ${author}</small>
                        </div>
                        <p class="drama-desc">${intro}</p>
                        
                        <!-- Watch Now Button (CLOSE TO TITLE) -->
                        <a href="/drama.html?id=${drama.id}" class="watch-btn">
                            <i class="bi bi-eye me-1"></i> Watch Now
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    elements.dramaList.insertAdjacentHTML('beforeend', dramasHtml);
    
    // Add CSS for consistent card heights
    addFixedCardStyles();
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
                    </div>
                </div>
            </div>
        `;
    }
}

// ============== CSS FOR FIXED HEIGHT CARDS ==============

function addFixedCardStyles() {
    if (document.getElementById('fixed-card-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'fixed-card-styles';
    style.textContent = `
        /* FIXED HEIGHT DRAMA CARDS */
        .drama-card {
            background: #1a1a1a;
            border: none;
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        .drama-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(13, 110, 253, 0.2);
        }
        
        /* COVER SECTION - FIXED HEIGHT */
        .card-cover {
            height: 250px;
            position: relative;
            overflow: hidden;
            background: #2a2a2a;
        }
        
        .drama-cover {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .drama-card:hover .drama-cover {
            transform: scale(1.05);
        }
        
        .episode-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(13, 110, 253, 0.9);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            backdrop-filter: blur(5px);
        }
        
        .play-overlay {
            position: absolute;
            bottom: 10px;
            right: 10px;
        }
        
        .play-btn {
            background: rgba(255, 255, 255, 0.9);
            color: #0d6efd;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.3s;
        }
        
        .play-btn:hover {
            background: #0d6efd;
            color: white;
            transform: scale(1.1);
        }
        
        /* CONTENT SECTION - FIXED HEIGHT */
        .card-content {
            padding: 15px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        
        .drama-title {
            font-size: 1rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 5px;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.6em;
        }
        
        .drama-meta {
            font-size: 0.85rem;
            color: #888;
            margin-bottom: 10px;
        }
        
        .drama-desc {
            font-size: 0.85rem;
            color: #aaa;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.8em;
            margin-bottom: 15px;
            flex-grow: 1;
        }
        
        /* WATCH BUTTON - CLOSE TO CONTENT */
        .watch-btn {
            background: transparent;
            border: 1px solid #0d6efd;
            color: #0d6efd;
            padding: 8px 15px;
            border-radius: 8px;
            text-decoration: none;
            text-align: center;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s;
            display: block;
            margin-top: auto;
        }
        
        .watch-btn:hover {
            background: #0d6efd;
            color: white;
            transform: translateY(-2px);
        }
        
        /* GRID LAYOUT FIX */
        #drama-list .col {
            margin-bottom: 20px;
        }
        
        /* RESPONSIVE */
        @media (max-width: 768px) {
            .card-cover {
                height: 200px;
            }
            
            .drama-title {
                font-size: 0.9rem;
            }
            
            .drama-desc {
                font-size: 0.8rem;
            }
        }
        
        @media (max-width: 576px) {
            .card-cover {
                height: 180px;
            }
            
            .card-content {
                padding: 12px;
            }
            
            .watch-btn {
                padding: 6px 12px;
                font-size: 0.85rem;
            }
        }
    `;
    
    document.head.appendChild(style);
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
