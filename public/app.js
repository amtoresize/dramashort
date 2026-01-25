// ============== CONFIGURATION ==============
const CONFIG = {
    apiBase: 'https://dramabos.asia/api/dramabox/api',
    itemsPerPage: 12,
    defaultImage: 'https://www.svgrepo.com/show/475529/cinema.svg'
};

// ============== DRAMA BOX APIS (UPDATED) ==============
const DRAMA_BOX_APIS = {
    // API REKOMENDASI (ganti foryou)
    recommend: async (page = 1) => {
        try {
            const response = await fetch(`${CONFIG.apiBase}/recommend/${page}?lang=in`);
            const data = await response.json();
            
            if (data.recommendList && data.recommendList.records) {
                return {
                    code: 0,
                    success: true,
                    data: data.recommendList.records,
                    hasMore: data.recommendList.current < data.recommendList.total,
                    nextPage: page + 1,
                    total: data.recommendList.total
                };
            }
            return { code: -1, error: 'Invalid response', data: [] };
        } catch (error) {
            console.error('DramaBox recommend error:', error);
            return { code: -1, error: error.message, data: [] };
        }
    },
    
    // API THEATER/HOME (ganti new)
    theater: async () => {
        try {
            const response = await fetch(`${CONFIG.apiBase}/theater?lang=in`);
            const data = await response.json();
            
            if (data.columnVoList && data.columnVoList.length > 0) {
                const bookList = data.columnVoList[0].bookList || [];
                return {
                    code: 0,
                    success: true,
                    data: bookList,
                    hasMore: false
                };
            }
            return { code: -1, error: 'Invalid response', data: [] };
        } catch (error) {
            console.error('DramaBox theater error:', error);
            return { code: -1, error: error.message, data: [] };
        }
    },
    
    // API TRENDING (ganti rank)
    trending: async (page = 1) => {
        try {
            const response = await fetch(`${CONFIG.apiBase}/recommend/${page}?lang=in`);
            const data = await response.json();
            
            if (data.recommendList && data.recommendList.records) {
                // Filter hanya yang punya rankVo (trending)
                const trendingItems = data.recommendList.records.filter(item => item.rankVo);
                return {
                    code: 0,
                    success: true,
                    data: trendingItems,
                    hasMore: data.recommendList.current < data.recommendList.total,
                    nextPage: page + 1
                };
            }
            return { code: -1, error: 'Invalid response', data: [] };
        } catch (error) {
            console.error('DramaBox trending error:', error);
            return { code: -1, error: error.message, data: [] };
        }
    },
    
    // API DETAIL DRAMA (updated structure)
    detail: async (bookId) => {
        try {
            const response = await fetch(`${CONFIG.apiBase}/drama/${bookId}?lang=in`);
            const data = await response.json();
            
            if (data.bookId) {
                return {
                    code: 0,
                    success: true,
                    data: data
                };
            }
            return { code: -1, error: 'Invalid response' };
        } catch (error) {
            console.error('DramaBox detail error:', error);
            return { code: -1, error: error.message };
        }
    },
    
    // API SEARCH
    search: async (query, page = 1) => {
        try {
            const response = await fetch(`${CONFIG.apiBase}/search/${encodeURIComponent(query)}?lang=in&page=${page}`);
            const data = await response.json();
            
            if (data.searchList) {
                return {
                    code: 0,
                    success: true,
                    data: data.searchList,
                    query: data.query,
                    hasMore: data.searchList.length >= 20,
                    nextPage: page + 1
                };
            }
            return { code: -1, error: 'Invalid response', data: [] };
        } catch (error) {
            console.error('DramaBox search error:', error);
            return { code: -1, error: error.message, data: [] };
        }
    },
    
    // API KATEGORI
    category: async () => {
        try {
            const response = await fetch(`${CONFIG.apiBase}/category?lang=in`);
            const data = await response.json();
            return {
                code: 0,
                success: true,
                data: data
            };
        } catch (error) {
            console.error('DramaBox category error:', error);
            return { code: -1, error: error.message, data: [] };
        }
    },
    
    // API LIST BY GENRE/FILTER
    list: async (page = 1, genre = '', dub = '', sort = 1) => {
        try {
            const url = `${CONFIG.apiBase}/list/${page}?lang=in${genre ? `&genre=${genre}` : ''}${dub ? `&dub=${dub}` : ''}&sort=${sort}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.records) {
                return {
                    code: 0,
                    success: true,
                    data: data.records,
                    hasMore: data.records.length >= 20,
                    nextPage: page + 1
                };
            }
            return { code: -1, error: 'Invalid response', data: [] };
        } catch (error) {
            console.error('DramaBox list error:', error);
            return { code: -1, error: error.message, data: [] };
        }
    },
    
    // API PLAY VIDEO (NEW)
    play: async (bookId, chapterIndex = 1) => {
        try {
            const response = await fetch(`${CONFIG.apiBase}/watch/${bookId}/${chapterIndex}?lang=in`);
            const data = await response.json();
            
            if (data.videos && data.videos.length > 0) {
                return {
                    code: 0,
                    success: true,
                    data: data,
                    chapterId: data.chapterId,
                    videos: data.videos,
                    name: data.name || `EP ${chapterIndex}`
                };
            }
            return { code: -1, error: 'No video found' };
        } catch (error) {
            console.error('DramaBox play error:', error);
            return { code: -1, error: error.message };
        }
    }
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
    
    dramabox: DRAMA_BOX_APIS,
    
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
let currentSource = 'dramabox';
let currentMode = 'recommend'; // 'recommend', 'theater', 'trending', 'search'

// ============== DOM ELEMENTS ==============
const elements = {
    dramaList: document.getElementById('drama-list'),
    loadMoreBtn: document.getElementById('load-more'),
    loadingIndicator: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state'),
    sourceSelector: null,
    modeSelector: null,
    searchInput: null,
    searchBtn: null
};

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DramaShort Enhanced - API Updated');
    
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
    
    const savedMode = localStorage.getItem('dramashort_mode');
    if (savedMode && ['recommend', 'theater', 'trending'].includes(savedMode)) {
        currentMode = savedMode;
    }
    
    // Initialize UI components
    initializeSourceSelector();
    initializeModeSelector();
    initializeSearch();
    initializeViewToggle();
    addScrollToTopButton();
    
    // Load initial data
    loadDramas();
    
    // Load More button event
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', function() {
            if (!isLoading && hasMoreData) {
                loadMoreDramas();
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
    if (buttonContainer) {
        buttonContainer.insertAdjacentHTML('afterbegin', selectorHTML);
        elements.sourceSelector = document.getElementById('source-selector');
        
        elements.sourceSelector.addEventListener('change', async function() {
            currentSource = this.value;
            currentPage = 1;
            currentOffset = 0;
            
            localStorage.setItem('dramashort_source', currentSource);
            
            if (elements.dramaList) {
                elements.dramaList.innerHTML = '';
            }
            
            updateModeSelector();
            await loadDramas();
            updatePageTitle();
        });
    }
}

// ============== MODE SELECTOR (DramaBox only) ==============
function initializeModeSelector() {
    const header = document.querySelector('.d-flex.justify-content-between');
    if (!header) return;
    
    const modeHTML = `
        <select id="mode-selector" class="form-select form-select-sm mode-selector" ${currentSource !== 'dramabox' ? 'disabled' : ''}>
            <option value="recommend" ${currentMode === 'recommend' ? 'selected' : ''}>Rekomendasi</option>
            <option value="theater" ${currentMode === 'theater' ? 'selected' : ''}>Theater</option>
            <option value="trending" ${currentMode === 'trending' ? 'selected' : ''}>Trending</option>
        </select>
    `;
    
    const buttonContainer = header.querySelector('.d-flex');
    if (buttonContainer) {
        const sourceSelector = buttonContainer.querySelector('.source-selector');
        if (sourceSelector) {
            sourceSelector.insertAdjacentHTML('afterend', modeHTML);
            elements.modeSelector = document.getElementById('mode-selector');
            
            elements.modeSelector.addEventListener('change', async function() {
                if (currentSource !== 'dramabox') return;
                
                currentMode = this.value;
                currentPage = 1;
                currentOffset = 0;
                
                localStorage.setItem('dramashort_mode', currentMode);
                
                if (elements.dramaList) {
                    elements.dramaList.innerHTML = '';
                }
                
                await loadDramas();
            });
        }
    }
}

function updateModeSelector() {
    if (!elements.modeSelector) return;
    
    if (currentSource === 'dramabox') {
        elements.modeSelector.disabled = false;
        elements.modeSelector.style.display = 'inline-block';
    } else {
        elements.modeSelector.disabled = true;
        elements.modeSelector.style.display = 'none';
    }
}

// ============== SEARCH FUNCTIONALITY ==============
function initializeSearch() {
    const header = document.querySelector('.d-flex.justify-content-between');
    if (!header) return;
    
    const searchHTML = `
        <div class="input-group input-group-sm ms-2" style="width: 200px;">
            <input type="text" id="search-input" class="form-control" placeholder="Cari drama..." value="">
            <button id="search-btn" class="btn btn-outline-secondary" type="button">
                <i class="bi bi-search"></i>
            </button>
        </div>
    `;
    
    const buttonContainer = header.querySelector('.d-flex');
    if (buttonContainer) {
        buttonContainer.insertAdjacentHTML('beforeend', searchHTML);
        
        elements.searchInput = document.getElementById('search-input');
        elements.searchBtn = document.getElementById('search-btn');
        
        // Search button click
        elements.searchBtn.addEventListener('click', performSearch);
        
        // Enter key in search input
        elements.searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    if (!elements.searchInput || currentSource !== 'dramabox') return;
    
    const query = elements.searchInput.value.trim();
    if (query.length === 0) {
        // If empty search, return to normal mode
        currentMode = 'recommend';
        currentPage = 1;
        if (elements.modeSelector) elements.modeSelector.value = 'recommend';
        loadDramas();
        return;
    }
    
    currentMode = 'search';
    currentPage = 1;
    
    if (elements.dramaList) {
        elements.dramaList.innerHTML = `<div class="col-12"><div class="alert alert-info">Mencari: <strong>${escapeHtml(query)}</strong></div></div>`;
    }
    
    loadDramas();
}

// ============== VIEW TOGGLE FUNCTIONS ==============
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
async function loadDramas() {
    if (isLoading) return;
    
    isLoading = true;
    showLoading(true);
    
    try {
        let result;
        const searchQuery = elements.searchInput ? elements.searchInput.value.trim() : '';
        
        switch(currentSource) {
            case 'dramabox':
                if (currentMode === 'search' && searchQuery) {
                    result = await WORKING_APIS.dramabox.search(searchQuery, currentPage);
                } else if (currentMode === 'theater') {
                    result = await WORKING_APIS.dramabox.theater();
                } else if (currentMode === 'trending') {
                    result = await WORKING_APIS.dramabox.trending(currentPage);
                } else {
                    result = await WORKING_APIS.dramabox.recommend(currentPage);
                }
                break;
                
            case 'netshort':
                result = await WORKING_APIS.netshort.explore(currentOffset, CONFIG.itemsPerPage);
                break;
                
            case 'melolo':
            default:
                const apiUrl = `${CONFIG.apiBase}/home?offset=${currentOffset}&count=${CONFIG.itemsPerPage}&lang=id`;
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
            if (currentPage === 1 && currentOffset === 0) {
                elements.dramaList.innerHTML = '';
            }
            
            if (result.data.length > 0) {
                renderDramas(result.data);
                
                // Update pagination
                if (currentSource === 'melolo' || currentSource === 'netshort') {
                    currentOffset = currentOffset + result.data.length;
                    hasMoreData = result.hasMore || (result.data.length >= CONFIG.itemsPerPage);
                } else if (currentSource === 'dramabox') {
                    hasMoreData = result.hasMore || false;
                } else {
                    hasMoreData = false;
                }
                
                updateLoadMoreButton();
                hideEmptyState();
            } else {
                showEmptyState(`Tidak ada drama ditemukan.`);
                hasMoreData = false;
                updateLoadMoreButton();
            }
        } else {
            throw new Error(result.error || `Invalid response from ${currentSource}`);
        }
    } catch (error) {
        console.error(`Error loading dramas from ${currentSource}:`, error);
        
        if (currentPage === 1 && currentOffset === 0) {
            showError(`Gagal memuat drama: ${error.message}`);
        }
        
        hasMoreData = false;
        updateLoadMoreButton();
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

async function loadMoreDramas() {
    if (currentSource === 'dramabox') {
        currentPage++;
    }
    await loadDramas();
}

// ============== RENDER DRAMAS ==============
function renderDramas(dramas) {
    if (!dramas || !Array.isArray(dramas) || dramas.length === 0) {
        return;
    }
    
    const dramasHtml = dramas.map(drama => {
        let dramaData = formatDramaData(drama);
        
        const title = escapeHtml(dramaData.title);
        const author = 'DramaBox'; // Default author
        const intro = escapeHtml(dramaData.intro);
        const episodes = dramaData.episodes;
        const cover = dramaData.cover;
        const dramaId = dramaData.id;
        const watchUrl = dramaData.watchUrl;
        const isDubbing = dramaData.isDubbing;
        const tags = dramaData.tags || [];
        const playCount = dramaData.playCount || '';
        const corner = dramaData.corner;
        const rankInfo = dramaData.rankVo;
        
        if (currentView === 'list') {
            return createListViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing, tags, playCount, corner, rankInfo);
        } else {
            return createGridViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing, tags, playCount, corner, rankInfo);
        }
    }).join('');
    
    elements.dramaList.insertAdjacentHTML('beforeend', dramasHtml);
    
    if (currentView === 'list') {
        updateView();
    }
}

// ============== FORMAT DATA ==============
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
        isDubbing: false,
        tags: [],
        playCount: '',
        corner: null,
        rankVo: null
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
            const title = drama.bookName || drama.title || 'Drama';
            const isDubbing = title.includes('(Sulih Suara)') || 
                            (drama.corner && drama.corner.name === 'Sulih Suara');
            
            formatted = {
                title: title,
                author: 'DramaBox',
                intro: drama.introduction || 'Drama from DramaBox',
                episodes: drama.chapterCount || 0,
                cover: drama.coverWap || drama.cover || CONFIG.defaultImage,
                id: drama.bookId || drama.id,
                watchUrl: `/dramabox.html?id=${drama.bookId || drama.id}`,
                source: 'dramabox',
                isDubbing: isDubbing,
                tags: drama.tags || [],
                playCount: drama.playCount || '',
                corner: drama.corner,
                rankVo: drama.rankVo
            };
            break;
            
        case 'netshort':
            const netTitle = drama.name || drama.shortPlayName || 'NetShort Drama';
            formatted = {
                title: netTitle,
                author: 'NetShort',
                intro: drama.labelArray ? drama.labelArray.join(', ') : 'Short drama',
                episodes: 1,
                cover: drama.shortPlayCover || drama.cover || CONFIG.defaultImage,
                id: drama.shortPlayId || drama.id,
                watchUrl: `/netshort.html?id=${drama.shortPlayId || drama.id}`,
                source: 'netshort',
                isDubbing: netTitle.toLowerCase().includes('(sulih suara)') || netTitle.toLowerCase().includes('sulih suara')
            };
            break;
    }
    
    return formatted;
}

// ============== CREATE CARD HTML ==============
function createGridViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing, tags = [], playCount = '', corner = null, rankInfo = null) {
    const tagsHtml = tags.length > 0 ? 
        `<div class="drama-tags mt-2">
            ${tags.slice(0, 3).map(tag => `<span class="badge bg-secondary me-1 mb-1">${escapeHtml(tag)}</span>`).join('')}
        </div>` : '';
    
    const cornerHtml = corner ? 
        `<div class="corner-badge" style="background: ${corner.color || '#FF2965'};">
            ${escapeHtml(corner.name)}
        </div>` : '';
    
    const rankHtml = rankInfo ? 
        `<div class="rank-info mt-2">
            <small class="text-warning"><i class="bi bi-fire"></i> ${escapeHtml(rankInfo.recCopy || 'Trending')}</small>
        </div>` : '';
    
    const playCountHtml = playCount ? 
        `<div class="play-count">
            <small><i class="bi bi-eye"></i> ${playCount}</small>
        </div>` : '';
    
    return `
        <div class="col">
            <div class="drama-card position-relative">
                <div class="card-cover">
                    <img src="${cover}" 
                         class="drama-cover"
                         alt="${title}"
                         loading="lazy"
                         onerror="this.src='${CONFIG.defaultImage}'">
                    
                    ${cornerHtml}
                    
                    ${episodes > 0 ? `
                    <div class="episode-badge">
                        ${episodes} ${currentSource === 'netshort' ? 'SHORT' : 'EP'}
                    </div>` : ''}
                    
                    <div class="source-badge">
                        ${currentSource === 'melolo' ? '🎬' : 
                          currentSource === 'dramabox' ? '📺' : '⚡'} 
                        ${currentSource.toUpperCase()}
                    </div>
                    
                    ${isDubbing ? `
                    <div class="badge bg-success position-absolute top-0 end-0 m-2">
                        <i class="bi bi-volume-up-fill"></i> Dub ID
                    </div>` : ''}
                    
                    <div class="play-overlay">
                        <a href="${watchUrl}" class="play-btn">
                            <i class="bi bi-play-fill"></i>
                        </a>
                    </div>
                </div>
                
                <div class="card-body">
                    <h6 class="drama-title">${title}</h6>
                    
                    ${rankHtml}
                    
                    <div class="drama-meta">
                        <small><i class="bi bi-person"></i> ${author}</small>
                        ${playCountHtml}
                    </div>
                    
                    <p class="drama-desc">${intro.length > 80 ? intro.substring(0, 80) + '...' : intro}</p>
                    
                    ${tagsHtml}
                    
                    <a href="${watchUrl}" class="btn btn-primary btn-sm w-100 mt-2">
                        <i class="bi bi-eye me-1"></i> 
                        ${currentSource === 'netshort' ? 'Watch Short' : 'Watch Now'}
                    </a>
                </div>
            </div>
        </div>
    `;
}

function createListViewHTML(title, author, intro, episodes, cover, dramaId, watchUrl, isDubbing, tags = [], playCount = '', corner = null, rankInfo = null) {
    const tagsHtml = tags.length > 0 ? 
        `<div class="drama-tags mt-2">
            ${tags.map(tag => `<span class="badge bg-secondary me-1 mb-1">${escapeHtml(tag)}</span>`).join('')}
        </div>` : '';
    
    const cornerHtml = corner ? 
        `<span class="badge ms-2" style="background: ${corner.color || '#FF2965'}; color: white;">
            ${escapeHtml(corner.name)}
        </span>` : '';
    
    const rankHtml = rankInfo ? 
        `<div class="rank-info mt-2">
            <span class="badge bg-warning text-dark">
                <i class="bi bi-trophy"></i> ${escapeHtml(rankInfo.recCopy || 'Trending')}
            </span>
        </div>` : '';
    
    return `
        <div class="col">
            <div class="drama-card list-view-card">
                <div class="row g-0">
                    <div class="col-md-3">
                        <div class="card-cover h-100">
                            <img src="${cover}" 
                                 class="drama-cover h-100 w-100"
                                 alt="${title}"
                                 loading="lazy"
                                 onerror="this.src='${CONFIG.defaultImage}'"
                                 style="object-fit: cover;">
                            
                            ${episodes > 0 ? `
                            <div class="episode-badge">
                                ${episodes} ${currentSource === 'netshort' ? 'SHORT' : 'EP'}
                            </div>` : ''}
                            
                            <div class="play-overlay">
                                <a href="${watchUrl}" class="play-btn">
                                    <i class="bi bi-play-fill"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-9">
                        <div class="card-body h-100 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start">
                                <h5 class="drama-title mb-1">${title}</h5>
                                ${cornerHtml}
                            </div>
                            
                            ${rankHtml}
                            
                            <div class="drama-meta mt-2">
                                <small><i class="bi bi-person"></i> ${author}</small>
                                ${episodes > 0 ? `<small class="ms-3"><i class="bi bi-film"></i> ${episodes} ${currentSource === 'netshort' ? 'Short' : 'Ep'}</small>` : ''}
                                ${playCount ? `<small class="ms-3"><i class="bi bi-eye"></i> ${playCount}</small>` : ''}
                                <small class="ms-3"><i class="bi bi-database"></i> ${currentSource.toUpperCase()}</small>
                            </div>
                            
                            ${isDubbing ? `
                            <span class="badge bg-success mt-2 align-self-start">
                                <i class="bi bi-volume-up-fill"></i> Sulih Suara Indonesia
                            </span>` : ''}
                            
                            <p class="drama-desc mt-2 flex-grow-1">${intro}</p>
                            
                            ${tagsHtml}
                            
                            <div class="d-flex gap-2 mt-3">
                                <a href="${watchUrl}" class="btn btn-primary btn-sm">
                                    <i class="bi bi-eye me-1"></i> 
                                    ${currentSource === 'netshort' ? 'Watch Short' : 'Watch Now'}
                                </a>
                                <button class="btn btn-outline-secondary btn-sm" onclick="addToFavorites('${dramaId}', '${currentSource}')">
                                    <i class="bi bi-bookmark"></i> Favorite
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="showDramaInfo('${dramaId}')">
                                    <i class="bi bi-info-circle"></i> Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============== UI HELPER FUNCTIONS ==============
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
                <p class="text-muted">Coba ganti sumber, mode, atau refresh</p>
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
                    <strong>Error:</strong> ${escapeHtml(message)}
                    <div class="mt-2">
                        <button onclick="location.reload()" class="btn btn-sm btn-outline-danger">
                            Refresh Page
                        </button>
                        <button onclick="switchSource('melolo')" class="btn btn-sm btn-outline-primary ms-2">
                            Switch to Melolo
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

// ============== UTILITY & GLOBAL FUNCTIONS ==============
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

window.showDramaInfo = async function(dramaId) {
    if (currentSource !== 'dramabox') return;
    
    try {
        const result = await WORKING_APIS.dramabox.detail(dramaId);
        if (result.code === 0) {
            const drama = result.data;
            const info = `
Judul: ${drama.bookName}
Episode: ${drama.chapterCount}
Tags: ${(drama.tags || []).join(', ')}
Status: ${drama.reserveStatus === 0 ? 'Aktif' : 'Tidak Aktif'}
            `;
            alert(info);
        }
    } catch (error) {
        console.error('Error getting drama info:', error);
    }
};

window.switchSource = function(source) {
    if (['melolo', 'dramabox', 'netshort'].includes(source)) {
        currentSource = source;
        currentOffset = 0;
        currentPage = 1;
        
        localStorage.setItem('dramashort_source', source);
        
        if (elements.dramaList) elements.dramaList.innerHTML = '';
        
        updateModeSelector();
        updatePageTitle();
        loadDramas();
    }
};

window.loadMoreDramas = loadMoreDramas;

function showNotification(message) {
    const existing = document.getElementById('temp-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'temp-notification';
    notification.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" style="position: fixed; top: 80px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="bi bi-check-circle me-2"></i> ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
}

// ============== CSS STYLES ==============
const styles = `
<style>
    .source-selector, .mode-selector {
        width: 140px !important;
        margin-right: 10px;
    }
    
    .drama-card {
        background: rgba(30, 30, 30, 0.8);
        border: 1px solid #444;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .drama-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
        border-color: #ff6b6b;
    }
    
    .card-cover {
        position: relative;
        height: 200px;
        overflow: hidden;
    }
    
    .drama-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .drama-card:hover .drama-cover {
        transform: scale(1.05);
    }
    
    .episode-badge {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .source-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 0.7rem;
    }
    
    .corner-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        color: white;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: bold;
    }
    
    .play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .drama-card:hover .play-overlay {
        opacity: 1;
    }
    
    .play-btn {
        width: 50px;
        height: 50px;
        background: rgba(255, 107, 107, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        text-decoration: none;
        transition: all 0.3s ease;
    }
    
    .play-btn:hover {
        background: #ff4757;
        transform: scale(1.1);
    }
    
    .card-body {
        padding: 15px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    
    .drama-title {
        font-size: 0.95rem;
        font-weight: bold;
        margin-bottom: 8px;
        line-height: 1.3;
        color: white;
    }
    
    .drama-meta {
        font-size: 0.8rem;
        color: #aaa;
        margin-bottom: 10px;
    }
    
    .drama-desc {
        font-size: 0.85rem;
        color: #ccc;
        flex-grow: 1;
        margin-bottom: 15px;
        line-height: 1.4;
    }
    
    .drama-tags {
        font-size: 0.75rem;
    }
    
    /* List View Specific */
    .list-view-card {
        height: auto;
    }
    
    .list-view-card .card-cover {
        height: 180px;
    }
    
    @media (max-width: 768px) {
        .list-view-card .row {
            flex-direction: column;
        }
        
        .list-view-card .col-md-3 {
            width: 100%;
        }
        
        .list-view-card .col-md-9 {
            width: 100%;
        }
        
        .source-selector, .mode-selector {
            width: 120px !important;
            margin-bottom: 5px;
        }
    }
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', styles);
