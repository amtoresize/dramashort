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
      <source src="${decodedVideoUrl}" type="video/mp4" />
    </video>

    <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
    <script>
      const videoUrl = "${decodedVideoUrl.replace(/"/g, '\\"')}";
      let player = null;
      let videoLoaded = false;
      let redirectTimer = null;
      let countdownTimer = null;
      let hasRedirected = false;
      
      // Function untuk redirect ke tab baru
      function redirectToNewTab() {
        if (hasRedirected) return;
        hasRedirected = true;
        
        console.log('Redirecting to new tab:', videoUrl);
        window.open(videoUrl, '_blank');
        
        // Optional: Tutup tab ini setelah 1 detik
        // setTimeout(function() {
        //   window.close();
        // }, 1000);
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
      
      // Function untuk cek error video
      function checkVideoError() {
        if (!player || hasRedirected) return;
        
        // Cek jika player punya error
        if (player.error()) {
          console.log('Video error detected, starting redirect...');
          startRedirectCountdown();
          return true;
        }
        
        // Cek jika video element punya error
        const videoElement = player.el().querySelector('video');
        if (videoElement && videoElement.error) {
          console.log('Video element error detected');
          startRedirectCountdown();
          return true;
        }
        
        return false;
      }
      
      // Inisialisasi player
      document.addEventListener('DOMContentLoaded', function() {
        try {
          player = videojs('my-video');
          
          // Event listeners
          player.on('loadeddata', function() {
            console.log('✅ Video loaded successfully');
            videoLoaded = true;
            if (redirectTimer) clearTimeout(redirectTimer);
            if (countdownTimer) clearInterval(countdownTimer);
            document.getElementById('redirectOverlay').style.display = 'none';
          });
          
          player.on('playing', function() {
            console.log('▶️ Video playing');
            videoLoaded = true;
            if (redirectTimer) clearTimeout(redirectTimer);
            if (countdownTimer) clearInterval(countdownTimer);
            document.getElementById('redirectOverlay').style.display = 'none';
          });
          
          player.on('error', function() {
            console.log('❌ Player error event fired');
            if (!hasRedirected) {
              startRedirectCountdown();
            }
          });
          
          // Coba play otomatis
          player.ready(function() {
            this.play().catch(function(error) {
              console.log('⚠️ Autoplay failed:', error.message);
              // Tidak langsung redirect, tunggu timer
            });
          });
          
          // Timer 1: Cek error setiap 500ms
          setInterval(function() {
            checkVideoError();
          }, 500);
          
          // Timer 2: Jika dalam 3 detik belum loaded, redirect
          redirectTimer = setTimeout(function() {
            if (!videoLoaded && !hasRedirected) {
              console.log('⏱️ 3 seconds passed, video not loaded');
              startRedirectCountdown();
            }
          }, 3000);
          
          // Timer 3: Force redirect setelah 6 detik
          setTimeout(function() {
            if (!videoLoaded && !hasRedirected) {
              console.log('🚨 Force redirect after 6 seconds');
              redirectToNewTab();
            }
          }, 6000);
          
        } catch (error) {
          console.error('Player initialization error:', error);
          startRedirectCountdown();
        }
      });
      
      // Fallback: Jika semua gagal, redirect setelah 10 detik
      setTimeout(function() {
        if (!videoLoaded && !hasRedirected) {
          console.log('🔥 Ultimate fallback redirect');
          redirectToNewTab();
        }
      }, 10000);
      
      // Cleanup
      window.addEventListener('beforeunload', function() {
        if (redirectTimer) clearTimeout(redirectTimer);
        if (countdownTimer) clearInterval(countdownTimer);
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
