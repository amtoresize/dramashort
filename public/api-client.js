// ============== api-client.js ==============

// Dramabos.asia API (Drama) - More content
const DRAMABOS_BASE = 'https://dramabos.asia/api';

// Sansekai API (Anime, Komik)
const SANSEKAI_BASE = 'https://api.sansekai.my.id/api';

// Simple cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchAPI(url) {
    const cacheKey = url;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============== DRAMA APIs (Dramabos.asia) ==============

// DramaBox API
export const dramabox = {
    foryou: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/foryou/${page}?lang=in`),
    latest: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/new/${page}?lang=in`),
    trending: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/rank/${page}?lang=in`),
    classify: () => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/classify?lang=in`),
    detail: (bookId) => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/drama/${bookId}?lang=in`),
    chapters: (bookId) => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/chapters/${bookId}?lang=in`),
    watch: (bookId, index) => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/watch/player?bookId=${bookId}&index=${index}&lang=in`),
    search: (query) => fetchAPI(`${DRAMABOS_BASE}/dramabox/api/suggest/${encodeURIComponent(query)}?lang=in`),
};

// ShortMax API
export const shortmax = {
    home: () => fetchAPI(`${DRAMABOS_BASE}/shortmax/api/v1/home?lang=id`),
    search: (query, page = 1) => fetchAPI(`${DRAMABOS_BASE}/shortmax/api/v1/search?q=${encodeURIComponent(query)}&lang=id&page=${page}`),
    episodes: (id) => fetchAPI(`${DRAMABOS_BASE}/shortmax/api/v1/episodes/${id}?lang=id`),
    play: (id, ep = 1) => fetchAPI(`${DRAMABOS_BASE}/shortmax/api/v1/play/${id}?lang=id&ep=${ep}`),
};

// Melolo API (Yang sudah dipakai)
export const melolo = {
    home: (offset = 0, count = 20) => fetchAPI(`${DRAMABOS_BASE}/melolo/api/v1/home?offset=${offset}&count=${count}&lang=id`),
    search: (query, offset = 0, count = 10) => fetchAPI(`${DRAMABOS_BASE}/melolo/api/v1/search?q=${encodeURIComponent(query)}&offset=${offset}&count=${count}`),
    detail: (id) => fetchAPI(`${DRAMABOS_BASE}/melolo/api/v1/detail/${id}`),
    video: (videoId) => fetchAPI(`${DRAMABOS_BASE}/melolo/api/v1/video/${videoId}`),
};

// FlickReels API
export const flickreels = {
    home: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/flick/home?page=${page}&page_size=20&lang=6`),
    latest: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/flick/latest?page=${page}&page_size=20&lang=6`),
    trending: () => fetchAPI(`${DRAMABOS_BASE}/flick/trending`),
    search: (query) => fetchAPI(`${DRAMABOS_BASE}/flick/search?keyword=${encodeURIComponent(query)}&lang=6`),
    detail: (id) => fetchAPI(`${DRAMABOS_BASE}/flick/drama/${id}?lang=6`),
};

// NetShort API
export const netshort = {
    explore: (offset = 0, limit = 20) => fetchAPI(`${DRAMABOS_BASE}/netshort/api/drama/explore?offset=${offset}&limit=${limit}`),
    discover: () => fetchAPI(`${DRAMABOS_BASE}/netshort/api/drama/discover`),
    search: (query, page = 1) => fetchAPI(`${DRAMABOS_BASE}/netshort/api/drama/find?q=${encodeURIComponent(query)}&page=${page}&size=20`),
    categories: () => fetchAPI(`${DRAMABOS_BASE}/netshort/api/drama/categories`),
    detail: (id) => fetchAPI(`${DRAMABOS_BASE}/netshort/api/drama/info/${id}`),
    watch: (id, ep) => fetchAPI(`${DRAMABOS_BASE}/netshort/api/drama/view/${id}/ep/${ep}`),
};

// RadReel API
export const radreel = {
    home: (page = 1, tab = 17) => fetchAPI(`${DRAMABOS_BASE}/radreel/api/v1/home?lang=id&tab=${tab}&page=${page}&limit=20`),
    search: (query, page = 1) => fetchAPI(`${DRAMABOS_BASE}/radreel/api/v1/search?q=${encodeURIComponent(query)}&lang=id&page=${page}`),
    rank: (type = 1, page = 1) => fetchAPI(`${DRAMABOS_BASE}/radreel/api/v1/rank?type=${type}&page=${page}&lang=id`),
    detail: (id) => fetchAPI(`${DRAMABOS_BASE}/radreel/api/v1/drama/${id}?lang=id`),
    episodes: (id) => fetchAPI(`${DRAMABOS_BASE}/radreel/api/v1/episodes/${id}?lang=id`),
    play: (id, seq = 0) => fetchAPI(`${DRAMABOS_BASE}/radreel/api/v1/play/${id}?seq=${seq}`),
    recommend: () => fetchAPI(`${DRAMABOS_BASE}/radreel/api/v1/recommend`),
};

// MeloShort API
export const meloshort = {
    home: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/meloshort/api/home?page=${page}&page_size=20`),
    ranking: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/meloshort/api/ranking?page=${page}&page_size=20`),
    recommend: (page = 1) => fetchAPI(`${DRAMABOS_BASE}/meloshort/api/recommend?page=${page}&page_size=20`),
    search: (query) => fetchAPI(`${DRAMABOS_BASE}/meloshort/api/search?q=${encodeURIComponent(query)}`),
    detail: (id) => fetchAPI(`${DRAMABOS_BASE}/meloshort/api/drama/${id}`),
    play: (id, ep) => fetchAPI(`${DRAMABOS_BASE}/meloshort/api/play/${id}/${ep}`),
};

// ============== ANIME API (Sansekai) ==============

export const anime = {
    latest: () => fetchAPI(`${SANSEKAI_BASE}/anime/latest`),
    recommended: (page = 1) => fetchAPI(`${SANSEKAI_BASE}/anime/recommended?page=${page}`),
    search: (query) => fetchAPI(`${SANSEKAI_BASE}/anime/search?query=${encodeURIComponent(query)}`),
    detail: (urlId) => fetchAPI(`${SANSEKAI_BASE}/anime/detail?urlId=${encodeURIComponent(urlId)}`),
    movie: () => fetchAPI(`${SANSEKAI_BASE}/anime/movie`),
    getVideo: (chapterUrlId, reso = '480p') => fetchAPI(`${SANSEKAI_BASE}/anime/getvideo?chapterUrlId=${encodeURIComponent(chapterUrlId)}&reso=${reso}`),
};

// ============== KOMIK API (Sansekai) ==============

export const komik = {
    recommended: (type) => fetchAPI(`${SANSEKAI_BASE}/komik/recommended?type=${type}`),
    latest: (type) => fetchAPI(`${SANSEKAI_BASE}/komik/latest?type=${type}`),
    search: (query) => fetchAPI(`${SANSEKAI_BASE}/komik/search?query=${encodeURIComponent(query)}`),
    popular: (page = 1) => fetchAPI(`${SANSEKAI_BASE}/komik/popular?page=${page}`),
    detail: (manga_id) => fetchAPI(`${SANSEKAI_BASE}/komik/detail?manga_id=${encodeURIComponent(manga_id)}`),
    chapters: (manga_id) => fetchAPI(`${SANSEKAI_BASE}/komik/chapterlist?manga_id=${encodeURIComponent(manga_id)}`),
    getImages: (chapter_id) => fetchAPI(`${SANSEKAI_BASE}/komik/getimage?chapter_id=${encodeURIComponent(chapter_id)}`),
};

// Helper: Get dramas from multiple sources
export async function getAllDramas(page = 1) {
    const results = await Promise.allSettled([
        dramabox.foryou(page),
        shortmax.home(),
        melolo.home(0, 20),
        radreel.home(page),
    ]);

    const dramas = [];
    results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            const data = result.value;
            const list = data?.data?.list || data?.data || data?.list || data || [];
            if (Array.isArray(list)) {
                const source = ['dramabox', 'shortmax', 'melolo', 'radreel'][idx];
                list.forEach(item => dramas.push({ ...item, _source: source }));
            }
        }
    });

    return dramas;
}

export default {
    dramabox,
    shortmax,
    melolo,
    flickreels,
    netshort,
    radreel,
    meloshort,
    anime,
    komik,
    getAllDramas,
};
