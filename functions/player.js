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
        margin-bottom: 30px;
      }
      
      .manual-button {
        padding: 15px 30px;
        background: #ff5555;
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 18px;
        cursor: pointer;
        margin-top: 20px;
      }
      
      .manual-button:hover {
        background: #ff7777;
      }
      
      .refresh-button {
        background: #5555ff;
        margin-right: 10px;
      }
      
      .refresh-button:hover {
        background: #7777ff;
      }
      
      .button-container {
        display: flex;
        gap: 15px;
      }
    </style>
  </head>
  <body>
    <div class="redirect-overlay" id="redirectOverlay">
      <div class="redirect-countdown" id="countdown">5</div>
      <div class="redirect-message" id="redirectMessage">
        Video tidak dapat diputar<br>
        Mengarahkan ke tab baru...
      </div>
      <div class="button-container">
        <button class="manual-button refresh-button" onclick="retryPlayback()">
          🔄 Coba Lagi
        </button>
        <button class="manual-button" onclick="forceRedirect()">
          🚀 Buka Sekarang
        </button>
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
      let currentRetryCount = 0;
      const maxRetries = 2;
      
      // Bersihkan cache player sebelumnya
      if (window.videojs) {
        const oldPlayers = videojs.getPlayers();
        for (const playerId in oldPlayers) {
          if (oldPlayers[playerId]) {
            oldPlayers[playerId].dispose();
          }
        }
      }
      
      // Inisialisasi player dengan timeout
      function initializePlayer() {
        try {
          player = videojs('my-video', {
            fluid: true,
            aspectRatio: '16:9',
            autoplay: true,
            playsinline: true
          }, function() {
            console.log('Player initialized');
            setupPlayerEvents();
          });
        } catch (error) {
          console.error('Failed to initialize player:', error);
          showRedirectOverlay('Gagal inisialisasi player');
        }
      }
      
      function setupPlayerEvents() {
        if (!player) return;
        
        // Reset state
        videoLoaded = false;
        currentRetryCount = 0;
        
        // Event listeners dengan error handling
        player.one('loadeddata', function() {
          console.log('Video loaded successfully');
          videoLoaded = true;
          clearRedirectTimers();
        });
        
        player.one('playing', function() {
          console.log('Video playing');
          videoLoaded = true;
          clearRedirectTimers();
          hideRedirectOverlay();
        });
        
        player.on('error', function() {
          console.log('Player error detected');
          handlePlaybackError();
        });
        
        // Coba play dengan retry mechanism
        attemptPlayback();
        
        // Start error detection timer
        startErrorDetection();
      }
      
      function attemptPlayback() {
        if (!player) return;
        
        player.play().then(function() {
          console.log('Autoplay successful');
          videoLoaded = true;
          clearRedirectTimers();
          hideRedirectOverlay();
        }).catch(function(error) {
          console.log('Autoplay failed:', error);
          currentRetryCount++;
          
          if (currentRetryCount <= maxRetries) {
            console.log('Retrying playback...', currentRetryCount);
            setTimeout(attemptPlayback, 1000);
          } else {
            handlePlaybackError();
          }
        });
      }
      
      function startErrorDetection() {
        // Clear existing timers
        clearRedirectTimers();
        
        // Timer utama: 5 detik untuk cek jika video gagal load
        redirectTimer = setTimeout(function() {
          if (!videoLoaded) {
            console.log('Video failed to load after 5 seconds');
            showRedirectOverlay('Video gagal dimuat');
          }
        }, 5000);
        
        // Backup timer: 8 detik untuk force redirect
        setTimeout(function() {
          if (!videoLoaded) {
            console.log('Force redirect after 8 seconds');
            forceRedirect();
          }
        }, 8000);
      }
      
      function handlePlaybackError() {
        if (currentRetryCount < maxRetries) {
          currentRetryCount++;
          console.log('Retrying... attempt', currentRetryCount);
          setTimeout(attemptPlayback, 1500);
        } else {
          showRedirectOverlay('Gagal memutar video');
        }
      }
      
      function showRedirectOverlay(message) {
        const overlay = document.getElementById('redirectOverlay');
        const messageElement = document.getElementById('redirectMessage');
        const countdownElement = document.getElementById('countdown');
        
        if (message) {
          messageElement.innerHTML = message + '<br>Mengarahkan ke tab baru...';
        }
        
        overlay.style.display = 'flex';
        
        // Start countdown
        let countdown = 5;
        countdownElement.textContent = countdown;
        
        clearInterval(countdownTimer);
        countdownTimer = setInterval(function() {
          countdown--;
          countdownElement.textContent = countdown;
          
          if (countdown <= 0) {
            forceRedirect();
          }
        }, 1000);
      }
      
      function hideRedirectOverlay() {
        const overlay = document.getElementById('redirectOverlay');
        overlay.style.display = 'none';
        clearInterval(countdownTimer);
      }
      
      function retryPlayback() {
        console.log('Manual retry requested');
        clearRedirectTimers();
        hideRedirectOverlay();
        
        // Buat URL baru dengan cache buster
        const newCacheBuster = originalVideoUrl + (originalVideoUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
        
        // Reload player dengan source baru
        if (player) {
          player.src({ type: 'video/mp4', src: newCacheBuster });
          player.load();
          currentRetryCount = 0;
          videoLoaded = false;
          attemptPlayback();
          startErrorDetection();
        }
      }
      
      function forceRedirect() {
        clearRedirectTimers();
        console.log('Redirecting to new tab:', originalVideoUrl);
        window.open(originalVideoUrl, '_blank');
        
        // Optional: Beri feedback
        const countdownElement = document.getElementById('countdown');
        const messageElement = document.getElementById('redirectMessage');
        countdownElement.textContent = '✓';
        messageElement.innerHTML = 'Membuka di tab baru...<br>Tab ini dapat ditutup';
      }
      
      function clearRedirectTimers() {
        if (redirectTimer) clearTimeout(redirectTimer);
        if (countdownTimer) clearInterval(countdownTimer);
      }
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlayer);
      } else {
        initializePlayer();
      }
      
      // Cleanup saat page unload
      window.addEventListener('beforeunload', function() {
        clearRedirectTimers();
        if (player) {
          player.dispose();
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
        
        // R untuk retry
        if (e.code === 'KeyR') {
          e.preventDefault();
          retryPlayback();
        }
        
        // T untuk force redirect
        if (e.code === 'KeyT') {
          e.preventDefault();
          forceRedirect();
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
