export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');
  
  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }
  
  // PLRJS Player
  const PLRJS_BASE = '';
  // Gunakan concatenation string biasa, bukan template literal
  const playerUrl = PLRJS_BASE + '' + (videoUrl);
  
  return Response.redirect(playerUrl, 302);
}
