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

 // ... (bagian atas sama seperti sebelumnya)

const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Drama Short Player</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style> /* style sama seperti sebelumnya */ </style>
</head>
<body>
  <div id="videoContainer">
    <video id="video" controls autoplay muted playsinline></video>
  </div>

  <script>
    const video = document.getElementById('video');
    const sourceUrl = decodeURIComponent("${safeUrl}");

    function showError(msg) {
      document.body.innerHTML = '<div class="error">' + msg + '</div>';
    }

    // Cek apakah ini HLS (.m3u8) atau MP4 langsung
    if (sourceUrl.includes('.m3u8') || sourceUrl.endsWith('.m3u8')) {
      // Mode HLS
      if (Hls.isSupported()) {
        const hls = new Hls({ lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) showError('Gagal memuat HLS: ' + data.type + ' - ' + data.details);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', () => video.play().catch(() => {}));
      } else {
        showError('Browser tidak support HLS.');
      }
    } else {
      // Mode MP4 langsung (atau format lain yang HTML5 support)
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => showError('Gagal autoplay: ' + e.message));
      });
      video.addEventListener('error', () => {
        showError('Gagal memuat video MP4. Mungkin link expired / diblok CORS.');
      });
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
