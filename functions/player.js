export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }

  // Decode URL parameter
  const decodedVideoUrl = decodeURIComponent(videoUrl);

  // HTML dengan player yang lebih profesional
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HeartScene Player</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
          }
          
          .player-container {
              width: 100%;
              max-width: 1200px;
              background: rgba(255, 255, 255, 0.95);
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              overflow: hidden;
          }
          
          .player-header {
              background: linear-gradient(90deg, #4f46e5, #7c3aed);
              color: white;
              padding: 20px 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
          }
          
          .logo {
              font-size: 24px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 10px;
          }
          
          .logo-icon {
              font-size: 28px;
          }
          
          .controls {
              display: flex;
              gap: 15px;
          }
          
          .control-btn {
              background: rgba(255, 255, 255, 0.2);
              border: none;
              color: white;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              transition: all 0.3s ease;
          }
          
          .control-btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: scale(1.1);
          }
          
          .player-wrapper {
              position: relative;
              width: 100%;
              padding-top: 56.25%; /* 16:9 Aspect Ratio */
          }
          
          .player-frame {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: none;
              background: #000;
          }
          
          .player-footer {
              padding: 20px 30px;
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
          }
          
          .video-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
          }
          
          .video-title {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
          }
          
          .video-url {
              font-size: 14px;
              color: #64748b;
              background: #f1f5f9;
              padding: 8px 15px;
              border-radius: 10px;
              word-break: break-all;
          }
          
          .player-controls {
              display: flex;
              gap: 10px;
              justify-content: center;
              margin-top: 20px;
          }
          
          .player-btn {
              padding: 12px 24px;
              background: #4f46e5;
              color: white;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.3s ease;
          }
          
          .player-btn:hover {
              background: #4338ca;
              transform: translateY(-2px);
          }
          
          .player-btn.secondary {
              background: #64748b;
          }
          
          .player-btn.secondary:hover {
              background: #475569;
          }
          
          @media (max-width: 768px) {
              .player-container {
                  border-radius: 10px;
              }
              
              .player-header {
                  padding: 15px;
              }
              
              .video-info {
                  flex-direction: column;
                  gap: 10px;
                  align-items: flex-start;
              }
              
              .player-controls {
                  flex-wrap: wrap;
              }
          }
          
          .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 18px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
          }
          
          .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: #4f46e5;
              animation: spin 1s ease-in-out infinite;
          }
          
          @keyframes spin {
              to { transform: rotate(360deg); }
          }
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  </head>
  <body>
      <div class="player-container">
          <div class="player-header">
              <div class="logo">
                  <span class="logo-icon">🎬</span>
                  <span>HeartScene Player</span>
              </div>
              <div class="controls">
                  <button class="control-btn" onclick="toggleFullscreen()" title="Fullscreen">
                      <i class="fas fa-expand"></i>
                  </button>
                  <button class="control-btn" onclick="togglePip()" title="Picture-in-Picture">
                      <i class="fas fa-clone"></i>
                  </button>
                  <button class="control-btn" onclick="reloadPlayer()" title="Reload">
                      <i class="fas fa-redo"></i>
                  </button>
              </div>
          </div>
          
          <div class="player-wrapper">
              <div class="loading" id="loading">
                  <div class="spinner"></div>
                  <span>Loading player...</span>
              </div>
              <iframe 
                  class="player-frame" 
                  id="videoPlayer"
                  src="${decodedVideoUrl}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="eager"
              ></iframe>
          </div>
          
          <div class="player-footer">
              <div class="video-info">
                  <div class="video-title">
                      <i class="fas fa-play-circle"></i> HeartScene Video Player
                  </div>
                  <div class="video-url" title="${decodedVideoUrl}">
                      <i class="fas fa-link"></i> ${decodedVideoUrl.substring(0, 50)}...
                  </div>
              </div>
              
              <div class="player-controls">
                  <button class="player-btn" onclick="playVideo()">
                      <i class="fas fa-play"></i> Play
                  </button>
                  <button class="player-btn" onclick="pauseVideo()">
                      <i class="fas fa-pause"></i> Pause
                  </button>
                  <button class="player-btn secondary" onclick="copyUrl()">
                      <i class="fas fa-copy"></i> Copy URL
                  </button>
                  <button class="player-btn secondary" onclick="openOriginal()">
                      <i class="fas fa-external-link-alt"></i> Open Original
                  </button>
              </div>
          </div>
      </div>

      <script>
          const videoPlayer = document.getElementById('videoPlayer');
          const loading = document.getElementById('loading');
          
          // Hide loading when iframe is loaded
          videoPlayer.onload = function() {
              loading.style.display = 'none';
              videoPlayer.style.opacity = '1';
          };
          
          // Show loading initially
          videoPlayer.style.opacity = '0';
          
          function playVideo() {
              videoPlayer.contentWindow.postMessage('play', '*');
          }
          
          function pauseVideo() {
              videoPlayer.contentWindow.postMessage('pause', '*');
          }
          
          function reloadPlayer() {
              loading.style.display = 'flex';
              videoPlayer.style.opacity = '0';
              videoPlayer.src = videoPlayer.src;
          }
          
          function toggleFullscreen() {
              if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
              } else {
                  if (document.exitFullscreen) {
                      document.exitFullscreen();
                  }
              }
          }
          
          async function togglePip() {
              try {
                  if (videoPlayer !== document.pictureInPictureElement) {
                      await videoPlayer.requestPictureInPicture();
                  } else {
                      await document.exitPictureInPicture();
                  }
              } catch (error) {
                  console.error('PiP failed:', error);
                  alert('Picture-in-Picture is not supported for this video');
              }
          }
          
          function copyUrl() {
              const url = '${decodedVideoUrl}';
              navigator.clipboard.writeText(url).then(() => {
                  alert('URL copied to clipboard!');
              });
          }
          
          function openOriginal() {
              window.open('${decodedVideoUrl}', '_blank');
          }
          
          // Handle fullscreen change
          document.addEventListener('fullscreenchange', function() {
              const fullscreenBtn = document.querySelector('.control-btn .fa-expand');
              if (document.fullscreenElement) {
                  fullscreenBtn.classList.remove('fa-expand');
                  fullscreenBtn.classList.add('fa-compress');
              } else {
                  fullscreenBtn.classList.remove('fa-compress');
                  fullscreenBtn.classList.add('fa-expand');
              }
          });
          
          // Keyboard shortcuts
          document.addEventListener('keydown', function(e) {
              switch(e.key) {
                  case ' ':
                  case 'k':
                      e.preventDefault();
                      playVideo();
                      break;
                  case 'f':
                      e.preventDefault();
                      toggleFullscreen();
                      break;
                  case 'r':
                      e.preventDefault();
                      reloadPlayer();
                      break;
              }
          });
      </script>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}
