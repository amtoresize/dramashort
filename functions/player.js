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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #000;
        color: white;
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
      }
      
      .container {
        padding: 20px;
      }
      
      .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="spinner"></div>
      <h2>Membuka video di tab baru...</h2>
      <p>Jika tidak otomatis terbuka, klik link di bawah:</p>
      <a href="${decodedVideoUrl}" target="_blank" style="color: #4CAF50; font-size: 18px;">
        Klik di sini untuk membuka video
      </a>
    </div>

    <script>
      // Langsung buka tab baru saat halaman load
      window.onload = function() {
        window.open('${decodedVideoUrl}', '_blank');
      };
      
      // Backup: Jika popup diblokir, redirect halaman ini
      setTimeout(function() {
        window.location.href = '${decodedVideoUrl}';
      }, 2000);
    </script>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8'
    }
  });
}
