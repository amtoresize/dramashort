export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get("url");
  
  if (!videoUrl) {
    return new Response("Missing video URL", { status: 400 });
  }
  
  const PLRJS_BASE = "https://cdn.plrjs.com/player/bsa9hkrkynde7/qqvmenqpoeve.html";
  const playerUrl = \`\${PLRJS_BASE}?file=\${encodeURIComponent(videoUrl)}\`;
  
  return Response.redirect(playerUrl, 302);
}
