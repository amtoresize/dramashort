export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }

  const decodedVideoUrl = decodeURIComponent(videoUrl);
  
  // Tambahkan cache buster
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
      
      .auto-link {
        display: none;
      }
    </style>
  </head>
  <body>
    <!-- Link hidden untuk auto redirect -->
    <a id="autoRedirectLink" class="auto-link" href="${decodedVideoUrl}" target="_blank"></a>
    
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
      
      // Function untuk redirect ke tab baru (100% WORK)
      function redirectToNewTab() {
        if (hasRedirected) return;
        hasRedirected = true;
        
        console.log('🚀 Executing redirect...');
        
        // METHOD 1: Click hidden link (paling reliable)
        try {
          const link = document.getElementById('autoRedirectLink');
          if (link) {
            link.click();
            console.log('✅ Hidden link clicked');
            return;
          }
        } catch (e) {}
        
        // METHOD 2: window.open dengan user gesture simulation
        try {
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.location.href = videoUrl;
            console.log('✅ Window.open with location.href');
            return;
          }
        } catch (e) {}
        
        // METHOD 3: Direct window.location (fallback)
        console.log('⚠️ Using fallback redirect');
        setTimeout(function() {
          window.location.href = videoUrl;
        }, 100);
      }
      
      // Function untuk mulai countdown
      function startRedirectCountdown() {
        if (hasRedirected) return;
        
        console.log('⏳ Starting redirect countdown');
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
            console.log('🎯 Countdown finished, redirecting...');
            redirectToNewTab();
            
            // Backup: Jika redirect gagal, coba lagi setelah 1 detik
            setTimeout(function() {
              if (!hasRedirected) {
                console.log('🔄 Backup redirect attempt');
                redirectToNewTab();
              }
            }, 1000);
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
      function initializePlayer() {
        // Cleanup dulu
        cleanupPreviousPlayer();
        
        try {
          player = videojs('my-video');
          console.log('✅ Player initialized');
          
          // Event listeners - gunakan .one() untuk sekali saja
          player.one('loadeddata', function() {
            console.log('✅ Video loaded successfully');
            videoLoaded = true;
            clearTimeout(redirectTimer);
            document.getElementById('redirectOverlay').style.display = 'none';
          });
          
          player.one('playing', function() {
            console.log('▶️ Video playing');
            videoLoaded = true;
            clearTimeout(redirectTimer);
            document.getElementById('redirectOverlay').style.display = 'none';
          });
          
          player.on('error', function() {
            console.log('❌ Player error detected');
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
          
          // Timer utama: Jika dalam 2 detik belum loaded, redirect
          redirectTimer = setTimeout(function() {
            if (!videoLoaded && !hasRedirected) {
              console.log('⏱️ 2 seconds passed, video not loaded');
              startRedirectCountdown();
            }
          }, 2000);
          
        } catch (error) {
          console.error('Player initialization error:', error);
          startRedirectCountdown();
        }
      }
      
      // Start everything when page loads
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlayer);
      } else {
        initializePlayer();
      }
      
      // Ultimate fallback: Redirect setelah 5 detik jika masih belum loaded
      setTimeout(function() {
        if (!videoLoaded && !hasRedirected) {
          console.log('🔥 Ultimate fallback redirect after 5s');
          redirectToNewTab();
        }
      }, 5000);
      
      // Cleanup
      window.addEventListener('beforeunload', function() {
        clearTimeout(redirectTimer);
        clearInterval(countdownTimer);
      });
      
      // Fullscreen on double click
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
        
        if (e.code === 'Space') {
          e.preventDefault();
          if (player.paused()) {
            player.play();
          } else {
            player.pause();
          }
        }
        
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
