// ============== CONFIGURATION ==============
const CONFIG = {
    apiBase: '/api',
    itemsPerPage: 12,
    defaultImage: 'https://www.svgrepo.com/show/475529/cinema.svg'
};

// ============== 3 WORKING APIS ==============
const WORKING_APIS = {
    // 1. MELOLO API (SUDAH JALAN DI APLIKASI ANDA)
    melolo: {
        // Home - via proxy Anda (sudah terbukti work)
        home: async (offset = 0, count = 12) => {
            try {
                const response = await fetch(`${CONFIG.apiBase}/home?offset=${offset}&count=${count}&lang=id`);
                const data = await response.json();
                
                if (data.code === 0 && data.data) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data,
                        hasMore: data.has_more || false,
                        nextOffset: data.next_offset || offset + data.data.length
                    };
                }
                return { code: -1, error: 'Invalid response', data: [] };
            } catch (error) {
                console.error('Melolo home error:', error);
                return { code: -1, error: error.message, data: [] };
            }
        },
        
        // Detail (via proxy)
        detail: async (dramaId) => {
            try {
                const response = await fetch(`${CONFIG.apiBase}/detail/${dramaId}?lang=id`);
                return await response.json();
            } catch (error) {
                console.error('Melolo detail error:', error);
                return { code: -1, error: error.message };
            }
        }
    },
    
    // 2. DRAMABOX API (BARU - SUDAH TERBUKTI WORK)
    dramabox: {
        // For You (Rekomendasi)
        foryou: async (page = 1) => {
            try {
                const response = await fetch(`https://dramabos.asia/api/dramabox/api/foryou/${page}?lang=in`);
                const data = await response.json();
                
                if (data.success && data.data && data.data.list) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data.list,
                        hasMore: data.data.list.length >= 20,
                        nextPage: page + 1,
                        total: data.data.list.length
                    };
                }
                return { code: -1, error: 'Invalid response', data: [] };
            } catch (error) {
                console.error('DramaBox foryou error:', error);
                return { code: -1, error: error.message, data: [] };
            }
        },
        
        // Latest (Terbaru)
        latest: async (page = 1) => {
            try {
                const response = await fetch(`https://dramabos.asia/api/dramabox/api/new/${page}?lang=in`);
                const data = await response.json();
                
                if (data.success && data.data && data.data.list) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data.list,
                        hasMore: data.data.list.length >= 20,
                        nextPage: page + 1
                    };
                }
                return { code: -1, error: 'Invalid response', data: [] };
            } catch (error) {
                console.error('DramaBox latest error:', error);
                return { code: -1, error: error.message, data: [] };
            }
        },
        
        // Trending (Ranking)
        trending: async (page = 1) => {
            try {
                const response = await fetch(`https://dramabos.asia/api/dramabox/api/rank/${page}?lang=in`);
                const data = await response.json();
                
                if (data.success && data.data && data.data.list) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data.list,
                        hasMore: data.data.list.length >= 20,
                        nextPage: page + 1
                    };
                }
                return { code: -1, error: 'Invalid response', data: [] };
            } catch (error) {
                console.error('DramaBox trending error:', error);
                return { code: -1, error: error.message, data: [] };
            }
        },
        
        // Detail Drama
        detail: async (bookId) => {
            try {
                const response = await fetch(`https://dramabos.asia/api/dramabox/api/drama/${bookId}?lang=in`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data
                    };
                }
                return { code: -1, error: 'Invalid response' };
            } catch (error) {
                console.error('DramaBox detail error:', error);
                return { code: -1, error: error.message };
            }
        }
    },
    
    // 3. NETSHORT API (BARU - SUDAH TERBUKTI WORK)
    netshort: {
        // Explore (Home)
        explore: async (offset = 0, limit = 20) => {
            try {
                const response = await fetch(`https://dramabos.asia/api/netshort/api/drama/explore?lang=id_ID&offset=${offset}&limit=${limit}`);
                const data = await response.json();
                
                if (data.success && data.data && data.data.result) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data.result,
                        hasMore: !data.data.isEnd,
                        nextOffset: data.data.next || offset + limit
                    };
                }
                return { code: -1, error: 'Invalid response', data: [] };
            } catch (error) {
                console.error('NetShort explore error:', error);
                return { code: -1, error: error.message, data: [] };
            }
        },
        
        // Discover (Trending/Populer)
        discover: async () => {
            try {
                const response = await fetch(`https://dramabos.asia/api/netshort/api/drama/discover?lang=id_ID`);
                const data = await response.json();
                
                if (data.success && data.data && data.data.dataList) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data.dataList,
                        hasMore: false
                    };
                }
                return { code: -1, error: 'Invalid response', data: [] };
            } catch (error) {
                console.error('NetShort discover error:', error);
                return { code: -1, error: error.message, data: [] };
            }
        },
        
        // Detail Drama
        detail: async (dramaId) => {
            try {
                const response = await fetch(`https://dramabos.asia/api/netshort/api/drama/info/${dramaId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    return {
                        code: 0,
                        success: true,
                        data: data.data
                    };
                }
                return { code: -1, error: 'Invalid response' };
            } catch (error) {
                console.error('NetShort detail error:', error);
                return { code: -1, error: error.message };
            }
        }
    }
};

// ============== STATE VARIABLES ==============
let currentOffset = 0;
let currentPage = 1;
let isLoading = false;
let hasMoreData = true;
let currentView = 'grid';
let currentSource = 'melolo'; // 'melolo', 'dramabox', 'netshort'

// ============== DOM ELEMENTS ==============
const elements = {
    dramaList: document.getElementById('drama-list'),
    loadMoreBtn: document.getElementById('load-more'),
    loadingIndicator: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state'),
    sourceSelector: null,
    tabSelector: null
};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DramaShort Enhanced initialized');
    
    // Load saved preferences
    const savedView = localStorage.getItem('dramashort_view');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
        currentView = savedView;
        updateView();
    }
    
    const savedSource = localStorage.getItem('dramashort_source');
    if (savedSource && ['melolo', 'dramabox', 'netshort'].includes(savedSource)) {
        currentSource = savedSource;
    }
    
    // Initialize UI components (TANPA TAB SELECTOR)
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

// ============== SOURCE SELECTOR ==============

/**
 * Initialize source selector (3 pilihan)
 */
function initializeSourceSelector() {
    const header = document.querySelector('.d-flex.justify-content-between');
    if (!header) return;
    
    const selectorHTML = `
        <select id="source-selector" class="form-select form-select-sm source-selector">
            <option value="melolo" ${currentSource === 'melolo' ? 'selected' : ''}>Melolo™</option>
            <option value="dramabox" ${currentSource === 'dramabox' ? 'selected' : ''}>DramaBox</option>
            <option value="netshort" ${currentSource === 'netshort' ? 'selected' : ''}>NetShort</option>
        </select>
    `;
    
    const buttonContainer = header.querySelector('.d-flex');
    buttonContainer.insertAdjacentHTML('afterbegin', selectorHTML);
    
    elements.sourceSelector = document.getElementById('source-selector');
    
    elements.sourceSelector.addEventListener('change', async function() {
        currentSource = this.value;
        currentOffset = 0;
        currentPage = 1;
        currentTab = 'home';
        
        // Save preference
        localStorage.setItem('dramashort_source', currentSource);
        
        // Update tab selector based on source
        updateTabSelector();
        
        // Clear and reload
        if (elements.dramaList) {
            elements.dramaList.innerHTML = '';
        }
        
        await loadDramas();
        
        // Update page title
        updatePageTitle();
    });
}

/**
 * Initialize tab selector (berbeda per source)
 */
function initializeTabSelector() {
    const header = document.querySelector('.d-flex.justify-content-between');
    if (!header) return;
    
    const tabHTML = `
        <div id="tab-selector" class="btn-group btn-group-sm ms-2">
            <button type="button" class="btn btn-outline-secondary tab-btn active" data-tab="home">Home</button>
            <button type="button" class="btn btn-outline-secondary tab-btn" data-tab="trending">Trending</button>
            <button type="button" class="btn btn-outline-secondary tab-btn" data-tab="latest">Latest</button>
        </div>
    `;
    
    const buttonContainer = header.querySelector('.d-flex');
    const sourceSelector = buttonContainer.querySelector('.source-selector');
    sourceSelector.insertAdjacentHTML('afterend', tabHTML);
    
    elements.tabSelector = document.getElementById('tab-selector');
    
    // Add event listeners to tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Change tab
            currentTab = this.dataset.tab;
            currentOffset = 0;
            currentPage = 1;
            
            // Reload dramas
            if (elements.dramaList) {
                elements.dramaList.innerHTML = '';
            }
            loadDramas();
        });
    });
}

/**
 * Update tab selector based on current source
 */
function updateTabSelector() {
    if (!elements.tabSelector) return;
    
    let tabs = [];
    
    switch(currentSource) {
        case 'melolo':
            tabs = ['home'];
            break;
        case 'dramabox':
            tabs = ['home', 'trending', 'latest'];
            break;
        case 'netshort':
            tabs = ['home', 'discover'];
            break;
    }
    
    // Update tab buttons
    elements.tabSelector.innerHTML = '';
    
    tabs.forEach(tab => {
        const active = tab === currentTab ? 'active' : '';
        const label = tab === 'home' ? 'Home' : 
                     tab === 'trending' ? 'Trending' : 
                     tab === 'latest' ? 'Latest' : 
                     tab === 'discover' ? 'Discover' : tab;
        
        elements.tabSelector.innerHTML += `
            <button type="button" class="btn btn-outline-secondary tab-btn ${active}" data-tab="${tab}">${label}</button>
        `;
    });
    
    // Re-add event listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentTab = this.dataset.tab;
            currentOffset = 0;
            currentPage = 1;
            
            if (elements.dramaList) {
                elements.dramaList.innerHTML = '';
            }
            loadDramas();
        });
    });
}

// ============== VIEW TOGGLE FUNCTIONS ==============
// (SAMA DENGAN SEBELUMNYA - tidak diubah)
function initializeViewToggle() {
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    
    if (!gridBtn || !listBtn) return;
    
    updateViewButtons();
    
    gridBtn.addEventListener('click', () => {
        if (currentView !== 'grid') {
            currentView = 'grid';
            updateView();
        }
    });
    
    listBtn.addEventListener('click', () => {
        if (currentView !== 'list') {
            currentView = 'list';
            updateView();
        }
    });
}

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

function updateView() {
    const dramaList = elements.dramaList;
    if (!dramaList) return;
    
    if (currentView === 'list') {
        dramaList.classList.add('list-view');
        dramaList.classList.remove('row-cols-2', 'row-cols-md-3', 'row-cols-lg-4', 'row-cols-xl-5', 'g-4');
        dramaList.classList.add('row-cols-1', 'g-3');
    } else {
        dramaList.classList.remove('list-view');
        dramaList.classList.remove('row-cols-1', 'g-3');
        dramaList.classList.add('row-cols-2', 'row-cols-md-3', 'row-cols-lg-4', 'row-cols-xl-5', 'g-4');
    }
    
    updateViewButtons();
    localStorage.setItem('dramashort_view', currentView);
}

// ============== LOAD DRAMAS ==============

/**
 * Load dramas based on current source
 */
async function loadDramas(offset = 0) {
    if (isLoading) return;
    
    isLoading = true;
    showLoading(true);
    
    try {
        let result;
        
        // HANYA berdasarkan currentSource, TANPA currentTab
        switch(currentSource) {
            case 'dramabox':
                // Selalu pakai foryou untuk DramaBox
                result = await WORKING_APIS.dramabox.foryou(1);
                break;
                
            case 'netshort':
                // Selalu pakai explore untuk NetShort
                result = await WORKING_APIS.netshort.explore(offset, CONFIG.itemsPerPage);
                break;
                
            case 'melolo':
            default:
                // Melolo via proxy Anda
                const apiUrl = `${CONFIG.apiBase}/home?offset=${offset}&count=${CONFIG.itemsPerPage}&lang=id`;
                const response = await fetch(apiUrl);
                result = await response.json();
                
                if (result.code === 0 && result.data) {
                    result = {
                        code: 0,
                        data: result.data,
                        hasMore: result.has_more || false
                    };
                }
                break;
        }
        
        // Process response
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
            if (offset === 0) {
                elements.dramaList.innerHTML = '';
            }
            
            if (result.data.length > 0) {
                renderDramas(result.data);
                
                // Update pagination state
                if (currentSource === 'melolo') {
                    currentOffset = offset + result.data.length;
                    hasMoreData = result.hasMore || (result.data.length >= CONFIG.itemsPerPage);
                } else if (currentSource === 'netshort') {
                    currentOffset = offset + result.data.length;
                    hasMoreData = result.hasMore || (result.data.length >= CONFIG.itemsPerPage);
                } else {
                    // dramabox biasanya single page
                    hasMoreData = false;
                }
                
                // Update UI
                updateLoadMoreButton();
                hideEmptyState();
                
            } else {
                showEmptyState(`No dramas found in ${currentSource}.`);
                hasMoreData = false;
                updateLoadMoreButton();
            }
        } else {
            throw new Error(`Invalid response from ${currentSource}`);
        }
        
    } catch (error) {
        console.error(`Error loading dramas from ${currentSource}:`, error);
        
        if (offset === 0) {
            showError(`Failed to load dramas: ${error.message}`);
        }
        
        hasMoreData = false;
        updateLoadMoreButton();
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

/**
 * Load more dramas
 */
async function loadMoreDramas() {
    await loadDramas();
}

// ============== RENDER DRAMAS ==============

/**
 * Render dramas with source-specific formatting
 */
function renderDramas(dramas) {
    if (!dramas || !Array.isArray(dramas) || dramas.length === 0) {
        return;
    }
    
    const dramasHtml = dramas.map(drama => {
        // Format berbeda untuk setiap source
        let dramaData = formatDramaData(drama);
        
        // Escape HTML
        const title = escapeHtml(dramaData.title);
        const author = escapeHtml(dramaData.author);
        const intro = escapeHtml(dramaData.intro);
        const episodes = dramaData.episodes;
        const cover = dramaData.cover;
        const dramaId = dramaData.id;
        const watchUrl = dramaData.watchUrl;
        
        // Grid view (default)
        if (currentView === 'list') {
            return createListViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl);
        } else {
            return createGridViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl);
        }
    }).join('');
    
    elements.dramaList.insertAdjacentHTML('beforeend', dramasHtml);
    
    // Apply view styles
    if (currentView === 'list') {
        updateView();
    }
}

/**
 * Format drama data based on source
 */
function formatDramaData(drama) {
    let formatted = {
        title: 'Untitled Drama',
        author: 'Unknown',
        intro: 'No description available.',
        episodes: 0,
        cover: CONFIG.defaultImage,
        id: '',
        watchUrl: '#',
        source: currentSource
    };
    
    switch(currentSource) {
        case 'melolo':
            formatted = {
                title: drama.name || drama.title,
                author: drama.author || 'Unknown Author',
                intro: drama.intro || 'No description.',
                episodes: drama.episodes || 0,
                cover: drama.cover || CONFIG.defaultImage,
                id: drama.id,
                watchUrl: `/drama.html?id=${drama.id}`,
                source: 'melolo'
            };
            break;
            
        case 'dramabox':
            formatted = {
                title: drama.bookName || drama.title,
                author: 'DramaBox',
                intro: drama.introduction || 'Drama from DramaBox',
                episodes: drama.chapterCount || 0,
                cover: drama.cover || CONFIG.defaultImage,
                id: drama.bookId,
                watchUrl: `/dramabox.html?id=${drama.bookId}`, // Akan buat page khusus
                source: 'dramabox'
            };
            break;
            
        case 'netshort':
            // NetShort punya 2 format: explore (simple) dan discover (detail)
            if (drama.shortPlayName) {
                // Format discover
                formatted = {
                    title: drama.shortPlayName,
                    author: 'NetShort',
                    intro: drama.labelArray ? drama.labelArray.join(', ') : 'Short drama',
                    episodes: 1,
                    cover: drama.shortPlayCover || drama.cover,
                    id: drama.shortPlayId || drama.id,
                    watchUrl: `/netshort.html?id=${drama.shortPlayId}`,
                    source: 'netshort'
                };
            } else {
                // Format explore
                formatted = {
                    title: drama.name || 'NetShort Drama',
                    author: 'NetShort',
                    intro: 'Short form drama',
                    episodes: 1,
                    cover: drama.cover || CONFIG.defaultImage,
                    id: drama.id,
                    watchUrl: `/netshort.html?id=${drama.id}`,
                    source: 'netshort'
                };
            }
            break;
    }
    
    return formatted;
}

/**
 * Create grid view HTML
 */
function createGridViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl) {
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
                        ${episodes} ${currentSource === 'netshort' ? 'SHORT' : 'EP'}
                    </div>
                    ` : ''}
                    
                    <!-- Source Badge -->
                    <div class="source-badge">
                        ${currentSource === 'melolo' ? '🎬' : 
                          currentSource === 'dramabox' ? '📺' : '⚡'} 
                        ${currentSource.toUpperCase()}
                    </div>
                    
                    <!-- Play Overlay -->
                    <div class="play-overlay">
                        <a href="${watchUrl}" class="play-btn">
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
                    <p class="drama-desc">${intro.length > 80 ? intro.substring(0, 80) + '...' : intro}</p>
                    
                    <!-- Watch Now Button -->
                    <a href="${watchUrl}" class="btn btn-primary btn-sm w-100">
                        <i class="bi bi-eye me-1"></i> 
                        ${currentSource === 'netshort' ? 'Watch Short' : 'Watch Now'}
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create list view HTML
 */
function createListViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl) {
    return `
        <div class="col">
            <div class="drama-card">
                <div class="card-cover">
                    <img src="${cover}" 
                         class="drama-cover"
                         alt="${title}"
                         loading="lazy"
                         onerror="this.src='${CONFIG.defaultImage}'">
                    
                    ${episodes > 0 ? `
                    <div class="episode-badge">
                        ${episodes} ${currentSource === 'netshort' ? 'SHORT' : 'EP'}
                    </div>
                    ` : ''}
                    
                    <div class="play-overlay">
                        <a href="${watchUrl}" class="play-btn">
                            <i class="bi bi-play-fill"></i>
                        </a>
                    </div>
                </div>
                
                <div class="card-body">
                    <h6 class="drama-title">${title}</h6>
                    <div class="drama-meta">
                        <small><i class="bi bi-person"></i> ${author}</small>
                        ${episodes > 0 ? `<small class="ms-3"><i class="bi bi-film"></i> ${episodes} ${currentSource === 'netshort' ? 'Short' : 'Ep'}</small>` : ''}
                        <small class="ms-3"><i class="bi bi-database"></i> ${currentSource.toUpperCase()}</small>
                    </div>
                    <p class="drama-desc">${intro}</p>
                    
                    <div class="d-flex gap-2">
                        <a href="${watchUrl}" class="btn btn-primary btn-sm">
                            <i class="bi bi-eye me-1"></i> 
                            ${currentSource === 'netshort' ? 'Watch Short' : 'Watch Now'}
                        </a>
                        <button class="btn btn-outline-secondary btn-sm" onclick="addToFavorites('${dramaId}', '${currentSource}')">
                            <i class="bi bi-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============== UI HELPER FUNCTIONS ==============
// (SAMA DENGAN SEBELUMNYA)
function showLoading(show) {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    if (elements.loadMoreBtn) {
        if (show) {
            elements.loadMoreBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status"></span>
                Loading...
            `;
            elements.loadMoreBtn.disabled = true;
        } else {
            elements.loadMoreBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Load More';
            elements.loadMoreBtn.disabled = false;
        }
    }
}

function updateLoadMoreButton() {
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.style.display = hasMoreData ? 'block' : 'none';
    }
}

function showEmptyState(message) {
    if (elements.emptyState) {
        elements.emptyState.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-emoji-frown display-1 text-muted"></i>
                <h4 class="mt-3">${escapeHtml(message)}</h4>
                <p class="text-muted">Try switching tab or source</p>
                <button onclick="location.reload()" class="btn btn-primary mt-3">
                    <i class="bi bi-arrow-clockwise"></i> Refresh
                </button>
            </div>
        `;
        elements.emptyState.style.display = 'block';
    }
}

function hideEmptyState() {
    if (elements.emptyState) {
        elements.emptyState.style.display = 'none';
    }
}

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

function updatePageTitle() {
    const titles = {
        melolo: 'DramaShort - Melolo Drama',
        dramabox: 'DramaShort - DramaBox Series',
        netshort: 'DramaShort - NetShort Videos'
    };
    
    if (titles[currentSource]) {
        document.title = titles[currentSource];
    }
}

// ============== UTILITY FUNCTIONS ==============
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addScrollToTopButton() {
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

// ============== GLOBAL FUNCTIONS ==============
window.addToFavorites = function(dramaId, source) {
    const favorites = JSON.parse(localStorage.getItem('dramashort_favorites') || '[]');
    const newFavorite = { id: dramaId, source, addedAt: new Date().toISOString() };
    
    const exists = favorites.find(fav => fav.id === dramaId && fav.source === source);
    if (!exists) {
        favorites.push(newFavorite);
        localStorage.setItem('dramashort_favorites', JSON.stringify(favorites));
        showNotification(`Added to favorites! (${source})`);
    } else {
        showNotification('Already in favorites!');
    }
};

function showNotification(message) {
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
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

window.switchSource = function(source) {
    if (['melolo', 'dramabox', 'netshort'].includes(source)) {
        currentSource = source;
        currentOffset = 0;
        
        // Save preference
        localStorage.setItem('dramashort_source', source);
        
        // Update UI
        updateSourceUI();
        
        // Clear and reload
        if (elements.dramaList) {
            elements.dramaList.innerHTML = '';
        }
        
        // Update page title
        updatePageTitle();
        
        // Load dramas
        loadDramas();
    }
};

// ============== GLOBAL EXPORTS ==============
window.loadDramas = loadDramas;
window.loadMoreDramas = loadMoreDramas;
