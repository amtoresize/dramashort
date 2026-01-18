export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.startsWith('/api/')) {
    const apiFunction = await import('./api/[[path]].js');
    return apiFunction.onRequest(context);
  }
  
  if (path.startsWith('/player')) {
    const playerFunction = await import('./player.js');
    return playerFunction.onRequest(context);
  }
  
  return context.env.ASSETS.fetch(request);
}
