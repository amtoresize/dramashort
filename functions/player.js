export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }

  const decodedVideoUrl = decodeURIComponent(videoUrl);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Redirecting...</title>
    <script>
      // Langsung buka tab baru
      window.open('${decodedVideoUrl}', '_blank');
      
      // Redirect halaman ini juga setelah 100ms
      setTimeout(() => {
        window.location.href = '${decodedVideoUrl}';
      }, 100);
    </script>
  </head>
  <body></body>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8'
    }
  });
}
