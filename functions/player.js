export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }

  const decodedVideoUrl = decodeURIComponent(videoUrl);

  // Tambahkan cache buster ke URL
  const cacheBustedUrl = decodedVideoUrl + (decodedVideoUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();

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
        background: rgba(0, 0, 0, 0.95);
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
      const originalVideoUrl = "${decodedVideoUrl}";
      const cacheBustedUrl = "${cacheBustedUrl}";
      let player = null;
      let videoLoaded = false;
      let redirectTimer = null;
      let countdownTimer = null;
      let retryCount = 0;
      const maxRetries = 1; // Hanya 1x retry
      
      // Inisialisasi player
      document.addEventListener('DOMContentLoaded', function() {
        // Cleanup player sebelumnya jika ada
        if (window.videojs && videojs.getPlayers()) {
          const players = videojs.getPlayers();
          Object.keys(players).forEach(function(playerId) {
            if (players[playerId]) {
              players[playerId].dispose();
            }
          });
        }
        
        // Buat player baru
        player = videojs('my-video');
        
        // Setup event listeners
        player.on('loadeddata', function() {
          console.log('✅ Video loaded');
          videoLoaded = true;
          clearTimeout(redirectTimer);
          clearInterval(countdownTimer);
          document.getElementById('redirectOverlay').style.display = 'none';
        });
        
        player.on('playing', function() {
          console.log('▶️ Video playing');
          videoLoaded = true;
          clearTimeout(redirectTimer);
          clearInterval(countdownTimer);
          document.getElementById('redirectOverlay').style.display = 'none';
        });
        
        player.on('error', function() {
          console.log('❌ Video error');
          handlePlaybackFailure();
        });
        
        // Coba play otomatis
        player.ready(function() {
          this.play().catch(function(error) {
            console.log('⚠️ Autoplay failed, retrying...');
            retryCount++;
            
            if (retryCount <= maxRetries) {
              // Tunggu 1 detik lalu coba lagi
              setTimeout(function() {
                player.play().catch(function() {
                  handlePlaybackFailure();
                });
              }, 1000);
            } else {
              handlePlaybackFailure();
            }
          });
        });
        
        // Timer utama: Jika dalam 4 detik video belum loaded, redirect
        redirectTimer = setTimeout(function() {
          if (!videoLoaded) {
            console.log('⏱️ Timeout - Video failed to load');
            redirectToNewTab();
          }
        }, 4000);
        
        // Backup timer: Force redirect setelah 6 detik
        setTimeout(function() {
          if (!videoLoaded) {
            console.log('🚨 Force redirect');
            redirectToNewTab();
          }
        }, 6000);
      });
      
      function handlePlaybackFailure() {
        console.log('🔧 Playback failed, redirecting...');
        redirectToNewTab();
      }
      
      function redirectToNewTab() {
        // Clear semua timer
        clearTimeout(redirectTimer);
        clearInterval(countdownTimer);
        
        // Tampilkan overlay
        const overlay = document.getElementById('redirectOverlay');
        const countdownElement = document.getElementById('countdown');
        overlay.style.display = 'flex';
        
        let countdown = 3;
        countdownElement.textContent = countdown;
        
        // Countdown
        countdownTimer = setInterval(function() {
          countdown--;
          countdownElement.textContent = countdown;
          
          if (countdown <= 0) {
            clearInterval(countdownTimer);
            window.open(originalVideoUrl, '_blank');
          }
        }, 1000);
      }
      
      // Cleanup saat page unload
      window.addEventListener('beforeunload', function() {
        clearTimeout(redirectTimer);
        clearInterval(countdownTimer);
        if (player) {
          player.dispose();
        }
      });
      
      // Keyboard shortcuts (opsional)
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
      'Pragma': 'no-cache'
    }
  });
}
