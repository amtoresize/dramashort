export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  let videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Parameter ?url= wajib diisi dengan link .m3u8', { status: 400 });
  }

  // Optional: tambah https:// kalau user lupa
  if (!videoUrl.startsWith('http')) {
    videoUrl = 'https://' + videoUrl;
  }

  // Encode biar aman (penting!)
  const safeUrl = encodeURIComponent(videoUrl);

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Drama Short Player</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #000;
      font-family: system-ui, sans-serif;
      overflow: hidden;
    }
    #videoContainer {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #111;
    }
    .error {
      color: white;
      text-align: center;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <div id="videoContainer">
    <video id="video" controls autoplay muted playsinline></video>
  </div>

  <script>
    const video = document.getElementById('video');
    const hlsUrl = decodeURIComponent("${safeUrl}");

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Optional config - bisa ditambah kalau perlu
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Autoplay dicegah:", e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          document.body.innerHTML = '<div class="error">Gagal memuat video: ' + data.type + ' - ' + data.details + '</div>';
        }
      });
    } 
    // Fallback kalau browser sudah support HLS native (contoh: Safari iOS)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    } 
    else {
      document.body.innerHTML = '<div class="error">Browser tidak mendukung HLS.</div>';
    }
  </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store, no-cache'
    }
  });
}
