export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }

  const decodedVideoUrl = decodeURIComponent(videoUrl);
  
  // Tambahkan cache buster dengan random parameter
  const randomCacheBuster = Math.random().toString(36).substring(7);
  const cacheBustedUrl = decodedVideoUrl + 
    (decodedVideoUrl.includes('?') ? '&' : '?') + 
    'cache=' + randomCacheBuster + 
    '&_t=' + Date.now();

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
      crossorigin="anonymous"
      data-setup='{"fluid": true, "aspectRatio": "16:9"}'
    >
      <source src="${cacheBustedUrl}" type="video/mp4" />
    </video>

    <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
    <script>
      const videoUrl = "${decodedVideoUrl.replace(/"/g, '\\"')}";
      const cacheBustedUrl = "${cacheBustedUrl.replace(/"/g, '\\"')}";
      let player = null;
      let videoLoaded = false;
      let redirectTimer = null;
      let countdownTimer = null;
      let hasRedirected = false;
      
      // Function untuk redirect ke tab baru
      function redirectToNewTab() {
        if (hasRedirected) return;
        hasRedirected = true;
        
        console.log('🚀 Redirecting to new tab');
        window.open(videoUrl, '_blank');
      }
      
      // Function untuk mulai countdown
      function startRedirectCountdown() {
        if (hasRedirected) return;
        
        const overlay = document.getElementById('redirectOverlay');
        const countdownElement = document.getElementById('countdown');
        
        overlay.style.display = 'flex';
        
        let countdown = 3;
        countdownElement.textContent = countdown;
        
        // Clear timer sebelumnya
        if (countdownTimer) clearInterval(countdownTimer);
        
        // Mulai countdown
        countdownTimer = setInterval(function() {
          countdown--;
          countdownElement.textContent = countdown;
          
          console.log('Countdown:', countdown);
          
          if (countdown <= 0) {
            clearInterval(countdownTimer);
            redirectToNewTab();
          }
        }, 1000);
      }
      
      // Cleanup player sebelumnya
      function cleanupPreviousPlayer() {
        if (window.videojs) {
          try {
            const players = videojs.getPlayers();
            for (const playerId in players) {
              if (players[playerId] && players[playerId].dispose) {
                players[playerId].dispose();
              }
            }
          } catch (e) {
            console.log('Cleanup error:', e);
          }
        }
      }
      
      // Inisialisasi player
      document.addEventListener('DOMContentLoaded', function() {
        // Cleanup dulu
        cleanupPreviousPlayer();
        
        try {
          player = videojs('my-video');
          console.log('✅ Player initialized with cache busted URL');
          
          // Event listeners
          player.on('loadeddata', function() {
            console.log('✅ Video loaded successfully');
            videoLoaded = true;
            clearTimeout(redirectTimer);
            document.getElementById('redirectOverlay').style.display = 'none';
          });
          
          player.on('playing', function() {
            console.log('▶️ Video playing');
            videoLoaded = true;
            clearTimeout(redirectTimer);
            document.getElementById('redirectOverlay').style.display = 'none';
          });
          
          player.on('error', function() {
            console.log('❌ Player error event');
            if (!videoLoaded && !hasRedirected) {
              startRedirectCountdown();
            }
          });
          
          // Coba play otomatis
          player.ready(function() {
            this.play().catch(function(error) {
              console.log('⚠️ Autoplay failed:', error.message);
            });
          });
          
          // Timer: Jika dalam 3 detik belum loaded, redirect
          redirectTimer = setTimeout(function() {
            if (!videoLoaded && !hasRedirected) {
              console.log('⏱️ 3 seconds passed, video not loaded');
              startRedirectCountdown();
            }
          }, 3000);
          
          // Backup timer: Force redirect setelah 5 detik
          setTimeout(function() {
            if (!videoLoaded && !hasRedirected) {
              console.log('🚨 Force redirect after 5 seconds');
              redirectToNewTab();
            }
          }, 5000);
          
        } catch (error) {
          console.error('Player initialization error:', error);
          startRedirectCountdown();
        }
      });
      
      // Fallback: Jika semua gagal, redirect setelah 8 detik
      setTimeout(function() {
        if (!videoLoaded && !hasRedirected) {
          console.log('🔥 Ultimate fallback redirect');
          redirectToNewTab();
        }
      }, 8000);
      
      // Cleanup saat page unload
      window.addEventListener('beforeunload', function() {
        clearTimeout(redirectTimer);
        clearInterval(countdownTimer);
      });
      
      // Fullscreen controls
      document.addEventListener('dblclick', function(e) {
        if (player && e.target.closest('.video-js')) {
          if (player.isFullscreen()) {
            player.exitFullscreen();
          } else {
            player.requestFullscreen();
          }
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
      });
    </script>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
