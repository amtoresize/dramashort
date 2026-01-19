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
    <style>
      body, html {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
      }
      
      #videoContainer {
        width: 100vw;
        height: 100vh;
        position: relative;
        background: #000;
      }
      
      video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #000;
      }
      
      .error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
        background: rgba(0,0,0,0.8);
        padding: 30px;
        border-radius: 10px;
        border: 2px solid red;
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="videoContainer">
      <video 
        id="videoPlayer"
        controls
        autoplay
        playsinline
        preload="auto"
      >
        <source src="${decodedVideoUrl}" type="video/mp4">
      </video>
      
      <div class="error" id="errorMessage">
        <h2>Video tidak bisa diputar</h2>
        <p>Membuka di tab baru...</p>
      </div>
    </div>

    <script>
      const video = document.getElementById('videoPlayer');
      const errorMessage = document.getElementById('errorMessage');
      const videoUrl = "${decodedVideoUrl}";
      
      // Coba play video
      video.play().catch(function(error) {
        console.log('Autoplay gagal, coba load video...');
        
        // Tunggu 2 detik untuk coba lagi
        setTimeout(function() {
          video.load();
          video.play().catch(function(error2) {
            console.log('Video tidak bisa diputar, buka tab baru');
            
            // Tampilkan pesan error
            errorMessage.style.display = 'block';
            
            // Buka di tab baru setelah 1 detik
            setTimeout(function() {
              window.open(videoUrl, '_blank');
            }, 1000);
          });
        }, 2000);
      });
      
      // Jika video error
      video.addEventListener('error', function() {
        console.log('Video error, buka tab baru');
        errorMessage.style.display = 'block';
        
        setTimeout(function() {
          window.open(videoUrl, '_blank');
        }, 1000);
      });
      
      // Jika video berhasil diputar, sembunyikan error
      video.addEventListener('playing', function() {
        errorMessage.style.display = 'none';
      });
      
      // Fullscreen saat klik video
      video.addEventListener('click', function() {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
      });
      
      // Keyboard shortcut: Space untuk play/pause
      document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
          e.preventDefault();
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }
        
        // F untuk fullscreen
        if (e.code === 'KeyF') {
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            if (video.requestFullscreen) {
              video.requestFullscreen();
            }
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
