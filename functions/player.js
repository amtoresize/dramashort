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
    <style>
      .close-btn {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      }
      .close-btn:hover {
        background: #ff6666;
      }
    </style>
    <script>
      // Langsung buka tab baru
      window.open('${decodedVideoUrl}', '_blank');
      
      // Fungsi close window
      function closeWindow() {
        window.close();
      }
      
      // Redirect halaman ini juga setelah 100ms
      setTimeout(() => {
        window.location.href = '${decodedVideoUrl}';
      }, 100);
    </script>
  </head>
  <body>
    <button class="close-btn" onclick="closeWindow()" title="Close window">×</button>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8'
    }
  });
}
