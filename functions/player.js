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
      
      .redirect-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        display: none;
      }
      
      .redirect-countdown {
        font-size: 48px;
        font-weight: bold;
        color: #ff5555;
        margin-bottom: 20px;
      }
      
      .redirect-message {
        font-size: 24px;
        text-align: center;
        padding: 0 20px;
      }
    </style>
  </head>
  <body>
    <div class="redirect-overlay" id="redirectOverlay">
      <div class="redirect-countdown" id="countdown">3</div>
      <div class="redirect-message">
        Video tidak dapat diputar<br>
        Mengarahkan ke tab baru...
      </div>
    </div>
    
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
      let player = null;
      let videoLoaded = false;
      let redirectTimer = null;
      let countdownTimer = null;
      
      // Inisialisasi player
      document.addEventListener('DOMContentLoaded', function() {
        player = videojs('my-video');
        
        // Mulai timer untuk deteksi error
        startErrorDetection();
        
        // Event listeners
        player.on('loadeddata', function() {
          console.log('Video loaded successfully');
          videoLoaded = true;
          clearTimeout(redirectTimer);
        });
        
        player.on('playing', function() {
          console.log('Video playing');
          videoLoaded = true;
          clearTimeout(redirectTimer);
        });
        
        player.on('error', function() {
          console.log('Video error detected');
          redirectToNewTab();
        });
        
        // Coba play otomatis
        player.ready(function() {
          this.play().catch(function(error) {
            console.log('Autoplay failed:', error);
            // Lanjutkan dengan error detection timer
          });
        });
      });
      
      function startErrorDetection() {
        // Set timer 3 detik untuk cek jika video gagal load
        redirectTimer = setTimeout(function() {
          if (!videoLoaded) {
            console.log('Video failed to load after 3 seconds');
            redirectToNewTab();
          }
        }, 3000);
        
        // Cek setiap detik untuk error state
        const errorCheckInterval = setInterval(function() {
          if (player && player.error()) {
            console.log('Periodic check: Video error detected');
            clearInterval(errorCheckInterval);
            redirectToNewTab();
          }
          
          // Jika video sudah loaded, stop checking
          if (videoLoaded) {
            clearInterval(errorCheckInterval);
          }
        }, 1000);
      }
      
      function redirectToNewTab() {
        clearTimeout(redirectTimer);
        
        // Tampilkan overlay redirect
        const overlay = document.getElementById('redirectOverlay');
        const countdownElement = document.getElementById('countdown');
        overlay.style.display = 'flex';
        
        let countdown = 3;
        
        // Countdown timer
        countdownTimer = setInterval(function() {
          countdown--;
          countdownElement.textContent = countdown;
          
          if (countdown <= 0) {
            clearInterval(countdownTimer);
            window.open(videoUrl, '_blank');
            
            // Optional: Tutup tab ini setelah redirect
            // window.close();
          }
        }, 1000);
      }
      
      // Fullscreen controls
      player.on('dblclick', function() {
        if (player.isFullscreen()) {
          player.exitFullscreen();
        } else {
          player.requestFullscreen();
        }
      });
      
      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        if (!player) return;
        
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
        
        // R untuk manual redirect
        if (e.code === 'KeyR') {
          e.preventDefault();
          redirectToNewTab();
        }
      });
      
      // Fallback: Jika player tidak berhasil diinisialisasi
      setTimeout(function() {
        if (!player) {
          console.log('Player initialization failed');
          redirectToNewTab();
        }
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
