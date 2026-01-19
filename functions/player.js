export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }

  const decodedVideoUrl = decodeURIComponent(videoUrl);

  // HTML dengan player yang lebih baik
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HeartScene Smart Player</title>
    <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        color: white;
      }
      
      .container {
        width: 100%;
        max-width: 1200px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        backdrop-filter: blur(10px);
      }
      
      .logo {
        font-size: 2.8rem;
        font-weight: bold;
        color: #00ff88;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
      }
      
      .tagline {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.1rem;
      }
      
      .player-section {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .player-container {
        background: rgba(0, 0, 0, 0.7);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(0, 255, 136, 0.1);
        border: 1px solid rgba(0, 255, 136, 0.2);
      }
      
      .video-js {
        width: 100% !important;
        height: 65vh !important;
      }
      
      .control-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 15px;
      }
      
      .control-btn {
        background: linear-gradient(45deg, #00ff88, #00cc6a);
        color: #000;
        border: none;
        padding: 15px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.3s ease;
      }
      
      .control-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
      }
      
      .control-btn.secondary {
        background: linear-gradient(45deg, #0088ff, #0066cc);
        color: white;
      }
      
      .control-btn.tertiary {
        background: linear-gradient(45deg, #ff0088, #cc0066);
        color: white;
      }
      
      .status-box {
        background: rgba(0, 255, 136, 0.1);
        border-left: 4px solid #00ff88;
        padding: 15px;
        border-radius: 10px;
        margin: 20px 0;
        display: none;
      }
      
      .status-box.active {
        display: block;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      .status-title {
        color: #00ff88;
        font-weight: bold;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        margin-top: 10px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff88, #0088ff);
        width: 0%;
        transition: width 0.3s ease;
      }
      
      .hidden-frame {
        display: none;
      }
      
      @media (max-width: 768px) {
        .video-js {
          height: 50vh !important;
        }
        
        .control-panel {
          grid-template-columns: 1fr;
        }
        
        .logo {
          font-size: 2rem;
        }
      }
      
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      
      .loading-overlay.active {
        display: flex;
      }
      
      .spinner {
        width: 60px;
        height: 60px;
        border: 5px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: #00ff88;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">
          <span>🎬</span>
          HeartScene Smart Player
        </div>
        <div class="tagline">Intelligent Video Streaming with CORS Bypass</div>
      </div>
      
      <div class="status-box" id="statusBox">
        <div class="status-title">
          <span id="statusIcon">⏳</span>
          <span id="statusText">Initializing player...</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="progressFill"></div>
        </div>
      </div>
      
      <div class="player-section">
        <div class="player-container">
          <video
            id="my-video"
            class="video-js vjs-default-skin vjs-big-play-centered"
            controls
            preload="auto"
            playsinline
            crossorigin="anonymous"
            data-setup='{}'
          >
            <source src="${decodedVideoUrl}" type="video/mp4" />
            <p class="vjs-no-js">
              Your browser doesn't support HTML5 video.
            </p>
          </video>
        </div>
        
        <div class="control-panel">
          <button class="control-btn" onclick="bypassCors()" id="bypassBtn">
            <span>🚀</span>
            Bypass CORS
          </button>
          
          <button class="control-btn secondary" onclick="preloadInBackground()">
            <span>📥</span>
            Preload Video
          </button>
          
          <button class="control-btn" onclick="forcePlay()">
            <span>▶️</span>
            Force Play
          </button>
          
          <button class="control-btn tertiary" onclick="showVideoUrl()">
            <span>🔗</span>
            Show URL
          </button>
          
          <button class="control-btn secondary" onclick="refreshPlayer()">
            <span>🔄</span>
            Refresh Player
          </button>
          
          <button class="control-btn" onclick="openInNewTab()">
            <span>🌐</span>
            New Tab Method
          </button>
        </div>
      </div>
    </div>
    
    <!-- Hidden iframe untuk preload -->
    <iframe class="hidden-frame" id="preloadFrame"></iframe>
    
    <!-- Loading overlay -->
    <div class="loading-overlay" id="loadingOverlay">
      <div class="spinner"></div>
      <div id="loadingText">Preparing video playback...</div>
    </div>

    <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
    <script>
      const videoUrl = "${decodedVideoUrl.replace(/"/g, '\\"')}";
      let player = null;
      let preloadWindow = null;
      let corsBypassed = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      // Inisialisasi Video.js player
      document.addEventListener('DOMContentLoaded', function() {
        player = videojs('my-video');
        
        // Update status
        updateStatus('Player initialized', '⏳');
        
        // Cek jika video bisa dimuat
        checkVideoAvailability();
        
        // Event listeners
        player.on('error', handlePlayerError);
        player.on('loadeddata', handleVideoLoaded);
        player.on('waiting', function() { updateStatus('Buffering...', '⏳'); });
        player.on('playing', function() { updateStatus('Playing', '▶️'); });
      });
      
      function updateStatus(text, icon) {
        const statusBox = document.getElementById('statusBox');
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        const progressFill = document.getElementById('progressFill');
        
        statusIcon.textContent = icon || 'ℹ️';
        statusText.textContent = text;
        statusBox.classList.add('active');
        
        // Update progress based on status
        if (text.includes('Playing')) {
          progressFill.style.width = '100%';
        } else if (text.includes('Buffering')) {
          progressFill.style.width = '50%';
        } else if (text.includes('Bypass')) {
          progressFill.style.width = '25%';
        }
        
        // Auto hide setelah 5 detik
        setTimeout(function() {
          statusBox.classList.remove('active');
        }, 5000);
      }
      
      function checkVideoAvailability() {
        updateStatus('Checking video availability...', '🔍');
        
        // Coba fetch video dengan timeout
        fetch(videoUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          headers: {
            'Accept': 'video/mp4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }).then(function() {
          updateStatus('Video is accessible', '✅');
          attemptAutoPlay();
        }).catch(function(error) {
          updateStatus('Direct access blocked by CORS', '⚠️');
          document.getElementById('bypassBtn').style.background = 'linear-gradient(45deg, #ff5500, #ff3300)';
          document.getElementById('bypassBtn').innerHTML = '<span>⚠️</span> CORS Blocked - Click to Bypass';
        });
      }
      
      function handlePlayerError() {
        console.log('Player error:', player.error());
        retryCount++;
        
        if (retryCount <= maxRetries && !corsBypassed) {
          updateStatus('Retrying... (' + retryCount + '/' + maxRetries + ')', '🔄');
          setTimeout(function() {
            player.src({ type: 'video/mp4', src: videoUrl });
            player.load();
            player.play().catch(function(e) { console.log('Retry play failed:', e); });
          }, 1000 * retryCount);
        } else {
          updateStatus('CORS blocked. Use Bypass button', '❌');
        }
      }
      
      function handleVideoLoaded() {
        updateStatus('Video loaded successfully', '✅');
        corsBypassed = true;
        document.getElementById('bypassBtn').innerHTML = '<span>✅</span> CORS Bypassed';
        document.getElementById('bypassBtn').style.background = 'linear-gradient(45deg, #00cc00, #00aa00)';
      }
      
      function bypassCors() {
        updateStatus('Starting CORS bypass sequence...', '⚡');
        showLoading('Bypassing CORS restrictions...');
        
        // Method 1: Coba dengan referer TikTok
        fetchWithReferer();
        
        // Method 2: Buka di popup untuk cache
        setTimeout(function() {
          preloadInBackground();
        }, 1000);
        
        // Method 3: Refresh player dengan cache
        setTimeout(function() {
          refreshPlayer();
          attemptAutoPlay();
        }, 2000);
      }
      
      function fetchWithReferer() {
        // Buat hidden iframe dengan referer TikTok
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = videoUrl;
        iframe.onload = function() {
          console.log('Iframe loaded with referer');
          updateStatus('Iframe preload successful', '✅');
        };
        document.body.appendChild(iframe);
        
        // Hapus setelah 5 detik
        setTimeout(function() {
          document.body.removeChild(iframe);
        }, 5000);
      }
      
      function preloadInBackground() {
        updateStatus('Preloading video in background...', '📥');
        
        // Buka popup kecil (akan cache video)
        preloadWindow = window.open(videoUrl, '_blank', 
          'width=100,height=100,top=1000,left=1000'
        );
        
        // Tutup setelah 3 detik
        setTimeout(function() {
          if (preloadWindow && !preloadWindow.closed) {
            preloadWindow.close();
            updateStatus('Background preload complete', '✅');
          }
        }, 3000);
      }
      
      function forcePlay() {
        showLoading('Forcing video playback...');
        updateStatus('Attempting forced playback...', '▶️');
        
        // Coba play dengan berbagai method
        player.play().then(function() {
          hideLoading();
          updateStatus('Playback successful!', '🎉');
        }).catch(function(error) {
          console.log('Force play failed:', error);
          
          // Coba method lain
          if (!corsBypassed) {
            updateStatus('Need CORS bypass first', '⚠️');
            bypassCors();
          } else {
            // Coba dengan user gesture simulation
            simulateClick();
          }
          
          hideLoading();
        });
      }
      
      function simulateClick() {
        // Simulasi klik pada video element
        const videoElement = player.el().querySelector('video');
        videoElement.click();
        
        // Coba play lagi setelah simulasi klik
        setTimeout(function() {
          player.play().catch(function(e) {
            updateStatus('Please click the play button manually', '🖱️');
          });
        }, 100);
      }
      
      function showVideoUrl() {
        alert('Video URL:\\n\\n' + videoUrl + 
              '\\n\\nCopy this URL and try in:\\n' +
              '1. VLC Media Player\\n' +
              '2. New browser tab\\n' +
              '3. Download manager');
      }
      
      function refreshPlayer() {
        updateStatus('Refreshing player with cache...', '🔄');
        
        // Simpan waktu current
        const currentTime = player.currentTime();
        
        // Reload source
        player.src({ type: 'video/mp4', src: videoUrl + '?t=' + Date.now() });
        player.load();
        
        // Coba kembali ke waktu sebelumnya
        setTimeout(function() {
          player.currentTime(currentTime);
          updateStatus('Player refreshed', '✅');
        }, 500);
      }
      
      function openInNewTab() {
        updateStatus('Opening in new tab for cache...', '🌐');
        
        // Buka di tab baru
        const newTab = window.open(videoUrl, '_blank');
        
        // Beri instruksi
        setTimeout(function() {
          updateStatus('Please return to this tab and refresh', '↩️');
          alert('Video opened in new tab.\\n' +
                'Wait for it to start loading, then:\\n' +
                '1. Return to this tab\\n' +
                '2. Click "Refresh Player"\\n' +
                '3. Click "Force Play"');
        }, 1000);
      }
      
      function attemptAutoPlay() {
        // Tunggu sebentar lalu coba play
        setTimeout(function() {
          player.play().then(function() {
            updateStatus('Autoplay successful!', '🎉');
          }).catch(function(e) {
            // Ignore autoplay errors
          });
        }, 1000);
      }
      
      function showLoading(text) {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = text;
        overlay.classList.add('active');
      }
      
      function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
      }
      
      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key.toLowerCase()) {
          case ' ':
            e.preventDefault();
            if (player.paused()) {
              player.play();
            } else {
              player.pause();
            }
            break;
          case 'b':
            e.preventDefault();
            bypassCors();
            break;
          case 'f':
            e.preventDefault();
            forcePlay();
            break;
          case 'r':
            e.preventDefault();
            refreshPlayer();
            break;
          case 'n':
            e.preventDefault();
            openInNewTab();
            break;
        }
      });
      
      // Auto bypass setelah 2 detik
      setTimeout(function() {
        if (!corsBypassed) {
          document.getElementById('bypassBtn').click();
        }
      }, 2000);
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
    },
  });
}
