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
    <title>HeartScene Player</title>
    <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
    <style>
      body, html {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
      }
      
      .video-js {
        width: 100vw !important;
        height: 100vh !important;
        position: fixed;
        top: 0;
        left: 0;
      }
      
      .vjs-big-play-button {
        position: absolute;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <video
      id="my-video"
      class="video-js vjs-default-skin vjs-big-play-centered"
      controls
      autoplay
      playsinline
      preload="auto"
      data-setup='{"fluid": true, "aspectRatio": "16:9"}'
    >
      <source src="${decodedVideoUrl}" type="video/mp4" />
    </video>

    <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
    <script>
      const videoUrl = "${decodedVideoUrl}";
      const player = videojs('my-video');
      
      // Coba play video
      player.ready(function() {
        this.play().catch(function(error) {
          console.log('Video tidak bisa diputar, buka tab baru');
          
          // Buka di tab baru setelah 1 detik
          setTimeout(function() {
            window.open(videoUrl, '_blank');
          }, 1000);
        });
      });
      
      // Jika video error, buka tab baru
      player.on('error', function() {
        console.log('Video error, buka tab baru');
        
        setTimeout(function() {
          window.open(videoUrl, '_blank');
        }, 1000);
      });
      
      // Fullscreen saat double click
      player.on('dblclick', function() {
        if (player.isFullscreen()) {
          player.exitFullscreen();
        } else {
          player.requestFullscreen();
        }
      });
      
      // Keyboard shortcut
      document.addEventListener('keydown', function(e) {
        // Space untuk play/pause
        if (e.code === 'Space') {
          e.preventDefault();
          if (player.paused()) {
            player.play();
          } else {
            player.pause();
          }
        }
        
        // F untuk fullscreen
        if (e.code === 'KeyF') {
          e.preventDefault();
          if (player.isFullscreen()) {
            player.exitFullscreen();
          } else {
            player.requestFullscreen();
          }
        }
      });
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
