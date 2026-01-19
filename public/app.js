// ============== CONFIGURATION ==============
const CONFIG = {
    apiBase: '/api',
    itemsPerPage: 12,
    defaultImage: 'https://www.svgrepo.com/show/475529/cinema.svg'
};

// ============== 3 WORKING APIS ==============
const WORKING_APIS = {
    melolo: {
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
    
    dramabox: {
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
    
    netshort: {
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
let currentTab = 'home'; // untuk tab selector

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
    
    // Initialize UI
    initializeSourceSelector();
    initializeTabSelector();
    initializeViewToggle();
    addScrollToTopButton();
    
    // Load initial dramas
    loadDramas();
    
    // Setup load more
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', function() {
            if (!isLoading && hasMoreData) {
                loadDramas(currentOffset);
            }
        });
    }
});

// ============== SOURCE SELECTOR ==============
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
        
        localStorage.setItem('dramashort_source', currentSource);
        
        updateTabSelector();
        
        if (elements.dramaList) {
            elements.dramaList.innerHTML = '';
        }
        
        await loadDramas();
        
        updatePageTitle();
    });
}

// ============== TAB SELECTOR ==============
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
    
    elements.tabSelector.innerHTML = '';
    
    tabs.forEach(tab => {
        const active = tab === currentTab ? 'active' : '';
        const label = tab === 'home' ? 'Home' : tab.charAt(0).toUpperCase() + tab.slice(1);
        
        elements.tabSelector.innerHTML += `
            <button type="button" class="btn btn-outline-secondary tab-btn ${active}" data-tab="${tab}">${label}</button>
        `;
    });
    
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

// ============== VIEW TOGGLE ==============
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
async function loadDramas(offset = 0) {
    if (isLoading) return;
    
    isLoading = true;
    showLoading(true);
    
    try {
        let result;
        
        switch(currentSource) {
            case 'dramabox':
                result = await WORKING_APIS.dramabox.foryou(currentPage);
                break;
                
            case 'netshort':
                // Default pakai explore (seperti versi awal)
                result = await WORKING_APIS.netshort.explore(offset, CONFIG.itemsPerPage);
                
                // Jika explore kosong (seperti sekarang), uncomment untuk fallback ke discover
                // if (result.data.length === 0) {
                //     result = await WORKING_APIS.netshort.discover();
                //     hasMoreData = false;
                // }
                break;
                
            case 'melolo':
            default:
                const apiUrl = `${CONFIG.apiBase}/home?offset=${offset}&count=${CONFIG.itemsPerPage}&lang=id`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                if (data.code === 0 && data.data) {
                    result = {
                        code: 0,
                        data: data.data,
                        hasMore: data.has_more || false
                    };
                }
                break;
        }
        
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
            if (offset === 0) {
                elements.dramaList.innerHTML = '';
            }
            
            if (result.data.length > 0) {
                renderDramas(result.data);
                
                if (currentSource === 'melolo' || currentSource === 'netshort') {
                    currentOffset = offset + result.data.length;
                    hasMoreData = result.hasMore || (result.data.length >= CONFIG.itemsPerPage);
                } else {
                    currentPage = result.nextPage || currentPage + 1;
                    hasMoreData = result.hasMore;
                }
                
                updateLoadMoreButton();
                hideEmptyState();
            } else {
                showEmptyState(`Tidak ada drama ditemukan di ${currentSource}.`);
                hasMoreData = false;
                updateLoadMoreButton();
            }
        } else {
            throw new Error(`Invalid response from ${currentSource}`);
        }
        
    } catch (error) {
        console.error(`Error loading from ${currentSource}:`, error);
        showError(`Gagal memuat drama: ${error.message}`);
        hasMoreData = false;
        updateLoadMoreButton();
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

// ============== RENDER DRAMAS ==============
function renderDramas(dramas) {
    if (!dramas || !Array.isArray(dramas) || dramas.length === 0) return;
    
    const dramasHtml = dramas.map(drama => {
        let data = formatDramaData(drama);
        
        const title = escapeHtml(data.title);
        const author = escapeHtml(data.author);
        const intro = escapeHtml(data.intro);
        const episodes = data.episodes;
        const cover = data.cover;
        const dramaId = data.id;
        const watchUrl = data.watchUrl;
        const isDubbing = data.isDubbing;
        
        if (currentView === 'list') {
            return createListViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing);
        } else {
            return createGridViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing);
        }
    }).join('');
    
    elements.dramaList.insertAdjacentHTML('beforeend', dramasHtml);
    
    if (currentView === 'list') updateView();
}

function formatDramaData(drama) {
    let formatted = {
        title: 'Untitled Drama',
        author: 'Unknown',
        intro: 'No description available.',
        episodes: 0,
        cover: CONFIG.defaultImage,
        id: '',
        watchUrl: '#',
        source: currentSource,
        isDubbing: false
    };
    
    switch(currentSource) {
        case 'melolo':
            formatted.title = drama.name || drama.title || 'Untitled';
            formatted.author = drama.author || 'Unknown Author';
            formatted.intro = drama.intro || 'No description.';
            formatted.episodes = drama.episodes || 0;
            formatted.cover = drama.cover || CONFIG.defaultImage;
            formatted.id = drama.id;
            formatted.watchUrl = `/drama.html?id=${drama.id}`;
            break;
            
        case 'dramabox':
            formatted.title = drama.bookName || drama.title || 'Untitled';
            formatted.author = 'DramaBox';
            formatted.intro = drama.introduction || 'Drama from DramaBox';
            formatted.episodes = drama.chapterCount || 0;
            formatted.cover = drama.cover || CONFIG.defaultImage;
            formatted.id = drama.bookId;
            formatted.watchUrl = `/dramabox.html?id=${drama.bookId}`;
            break;
            
        case 'netshort':
            const title = drama.name || drama.shortPlayName || 'NetShort Drama';
            formatted.title = title;
            formatted.author = 'NetShort';
            formatted.intro = drama.labelArray ? drama.labelArray.join(', ') : 'Short drama';
            formatted.episodes = 1;
            formatted.cover = drama.shortPlayCover || drama.cover || CONFIG.defaultImage;
            formatted.id = drama.shortPlayId || drama.id;
            formatted.watchUrl = `/netshort.html?id=${formatted.id}`;
            formatted.isDubbing = title.toLowerCase().includes('(sulih suara)') || title.toLowerCase().includes('sulih suara');
            break;
    }
    
    return formatted;
}

// Tambahkan isDubbing di createGridViewHTML (contoh posisi setelah source-badge)
function createGridViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing) {
    return `
        <div class="col">
            <div class="drama-card position-relative">
                <div class="card-cover">
                    <img src="${cover}" class="drama-cover" alt="${title}" loading="lazy" onerror="this.src='${CONFIG.defaultImage}'">
                    
                    ${episodes > 0 ? `<div class="episode-badge">${episodes} ${currentSource === 'netshort' ? 'SHORT' : 'EP'}</div>` : ''}
                    
                    <div class="source-badge">${currentSource.toUpperCase()}</div>
                    
                    ${isDubbing ? `
                    <div class="badge bg-success position-absolute top-0 end-0 m-2">
                        <i class="bi bi-volume-up-fill"></i> Dub ID
                    </div>` : ''}
                    
                    <div class="play-overlay">
                        <a href="${watchUrl}" class="play-btn"><i class="bi bi-play-fill"></i></a>
                    </div>
                </div>
                
                <div class="card-body">
                    <h6 class="drama-title">${title}</h6>
                    <div class="drama-meta"><small><i class="bi bi-person"></i> ${author}</small></div>
                    <p class="drama-desc">${intro.substring(0, 80)}${intro.length > 80 ? '...' : ''}</p>
                    <a href="${watchUrl}" class="btn btn-primary btn-sm w-100">Nonton</a>
                </div>
            </div>
        </div>
    `;
}

// Tambahkan isDubbing di createListViewHTML (contoh setelah drama-meta)
function createListViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing) {
    return `
        <div class="col">
            <div class="drama-card">
                <div class="card-cover">
                    <img src="${cover}" class="drama-cover" alt="${title}" loading="lazy" onerror="this.src='${CONFIG.defaultImage}'">
                    
                    ${episodes > 0 ? `<div class="episode-badge">${episodes} ${currentSource === 'netshort' ? 'SHORT' : 'EP'}</div>` : ''}
                    
                    <div class="play-overlay">
                        <a href="${watchUrl}" class="play-btn"><i class="bi bi-play-fill"></i></a>
                    </div>
                </div>
                
                <div class="card-body">
                    <h6 class="drama-title">${title}</h6>
                    <div class="drama-meta">
                        <small><i class="bi bi-person"></i> ${author}</small>
                        ${episodes > 0 ? `<small class="ms-3"><i class="bi bi-film"></i> ${episodes} ${currentSource === 'netshort' ? 'Short' : 'Ep'}</small>` : ''}
                        <small class="ms-3"><i class="bi bi-database"></i> ${currentSource.toUpperCase()}</small>
                    </div>
                    
                    ${isDubbing ? `<span class="badge bg-success mt-2"><i class="bi bi-volume-up-fill"></i> Dub ID</span>` : ''}
                    
                    <p class="drama-desc">${intro}</p>
                    
                    <div class="d-flex gap-2">
                        <a href="${watchUrl}" class="btn btn-primary btn-sm">Nonton</a>
                        <button class="btn btn-outline-secondary btn-sm" onclick="addToFavorites('${dramaId}', '${currentSource}')">
                            <i class="bi bi-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// (Fungsi-fungsi helper lain seperti showLoading, updateLoadMoreButton, showEmptyState, hideEmptyState, showError, escapeHtml, addScrollToTopButton, addToFavorites, showNotification, switchSource, dll tetap seperti versi awal kamu - tidak perlu diganti)

function updatePageTitle() {
    const titles = {
        melolo: 'DramaShort - Melolo Drama',
        dramabox: 'DramaShort - DramaBox Series',
        netshort: 'DramaShort - NetShort'
    };
    
    if (titles[currentSource]) document.title = titles[currentSource];
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
        if (notification.parentNode) notification.remove();
    }, 3000);
}

window.switchSource = function(source) {
    if (['melolo', 'dramabox', 'netshort'].includes(source)) {
        currentSource = source;
        currentOffset = 0;
        
        localStorage.setItem('dramashort_source', source);
        
        if (elements.dramaList) elements.dramaList.innerHTML = '';
        
        updatePageTitle();
        loadDramas();
    }
};

window.loadDramas = loadDramas;
