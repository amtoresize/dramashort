export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  
  const BASE_URL = 'https://dramabos.asia/api/melolo/api/v1';
  const params = new URLSearchParams(url.search);
  const lang = params.get('lang') || 'id';
  
  try {
    let apiUrl;
    
    if (path.startsWith('detail/')) {
      const id = path.replace('detail/', '');
      apiUrl = BASE_URL + '/detail/' + id + '?lang=' + lang;
    } 
    else if (path.startsWith('video/')) {
      const vid = path.replace('video/', '');
      apiUrl = BASE_URL + '/video/' + vid + '?lang=' + lang;
    }
    else if (path === 'home') {
      const offset = params.get('offset') || 0;
      const count = params.get('count') || 18;
      apiUrl = BASE_URL + '/home?offset=' + offset + '&count=' + count + '&lang=' + lang;
    }
    else {
      return new Response('Not Found', { status: 404 });
    }
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
