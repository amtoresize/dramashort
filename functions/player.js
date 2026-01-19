export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response('Missing video URL', { status: 400 });
  }

  const decodedVideoUrl = decodeURIComponent(videoUrl);

  // HTML dengan video element yang sederhana dan efektif
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HeartScene Video Player</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #000428, #004e92);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
          }
          
          .container {
              width: 100%;
              max-width: 1000px;
              text-align: center;
          }
          
          .header {
              margin-bottom: 20px;
              color: white;
          }
          
          .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
          }
          
          .tagline {
              color: rgba(255, 255, 255, 0.8);
              font-size: 14px;
          }
          
          .video-wrapper {
              position: relative;
              width: 100%;
              background: #000;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          video {
              width: 100%;
              height: auto;
              max-height: 70vh;
              display: block;
          }
          
          .controls-panel {
              background: rgba(0, 0, 0, 0.8);
              padding: 15px;
              margin-top: 20px;
              border-radius: 10px;
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              justify-content: center;
              align-items: center;
          }
          
          .control-btn {
              background: linear-gradient(45deg, #ff416c, #ff4b2b);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 25px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.3s ease;
          }
          
          .control-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(255, 65, 108, 0.4);
          }
          
          .control-btn.secondary {
              background: linear-gradient(45deg, #4776E6, #8E54E9);
          }
          
          .status {
              color: white;
              margin-top: 15px;
              padding: 10px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              font-size: 14px;
              display: inline-block;
          }
          
          .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              text-align: center;
          }
          
          .spinner {
              width: 50px;
              height: 50px;
              border: 3px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: #ff416c;
              animation: spin 1s linear infinite;
              margin: 0 auto 10px;
          }
          
          @keyframes spin {
              to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
              .container {
                  padding: 10px;
              }
              
              .logo {
                  font-size: 22px;
              }
              
              .controls-panel {
                  flex-direction: column;
              }
              
              .control-btn {
                  width: 100%;
                  justify-content: center;
              }
              
              video {
                  max-height: 60vh;
              }
          }
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">
                  <i class="fas fa-play-circle"></i>
                  HeartScene Player
              </div>
              <div class="tagline">Professional Video Streaming</div>
          </div>
          
          <div class="video-wrapper">
              <div class="loading" id="loading">
                  <div class="spinner"></div>
                  <div>Loading video...</div>
              </div>
              
              <video 
                  id="videoPlayer"
                  controls
                  autoplay
                  playsinline
                  preload="auto"
                  crossorigin="anonymous"
              >
                  <source src="${decodedVideoUrl}" type="video/mp4">
                  Your browser does not support the video tag.
              </video>
          </div>
          
          <div class="status" id="status">
              <i class="fas fa-circle" style="color: #4CAF50;"></i>
              Ready to play
          </div>
          
          <div class="controls-panel">
              <button class="control-btn" onclick="togglePlayPause()" id="playPauseBtn">
                  <i class="fas fa-play"></i>
                  <span>Play/Pause</span>
              </button>
              
              <button class="control-btn secondary" onclick="toggleMute()" id="muteBtn">
                  <i class="fas fa-volume-up"></i>
                  <span>Mute/Unmute</span>
              </button>
              
              <button class="control-btn" onclick="toggleFullscreen()">
                  <i class="fas fa-expand"></i>
                  <span>Fullscreen</span>
              </button>
              
              <button class="control-btn secondary" onclick="downloadVideo()">
                  <i class="fas fa-download"></i>
                  <span>Download</span>
              </button>
              
              <button class="control-btn" onclick="copyVideoLink()">
                  <i class="fas fa-link"></i>
                  <span>Copy Link</span>
              </button>
          </div>
      </div>

      <script>
          const video = document.getElementById('videoPlayer');
          const loading = document.getElementById('loading');
          const status = document.getElementById('status');
          const playPauseBtn = document.getElementById('playPauseBtn');
          const muteBtn = document.getElementById('muteBtn');
          
          // Hide loading when video can play
          video.addEventListener('canplay', () => {
              loading.style.display = 'none';
              updateStatus('Video ready - Click play to start');
          });
          
          video.addEventListener('waiting', () => {
              loading.style.display = 'block';
              updateStatus('Buffering...');
          });
          
          video.addEventListener('playing', () => {
              loading.style.display = 'none';
              updateStatus('Playing');
          });
          
          video.addEventListener('pause', () => {
              updateStatus('Paused');
          });
          
          video.addEventListener('error', (e) => {
              loading.style.display = 'none';
              console.error('Video error:', video.error);
              updateStatus('Error loading video. Try downloading instead.', 'error');
          });
          
          // Update button icons based on video state
          video.addEventListener('play', () => {
              playPauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
          });
          
          video.addEventListener('pause', () => {
              playPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
          });
          
          video.addEventListener('volumechange', () => {
              if (video.muted) {
                  muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Unmute</span>';
              } else {
                  muteBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Mute</span>';
              }
          });
          
          function togglePlayPause() {
              if (video.paused) {
                  video.play().catch(e => {
                      updateStatus('Click the video to play', 'warning');
                  });
              } else {
                  video.pause();
              }
          }
          
          function toggleMute() {
              video.muted = !video.muted;
          }
          
          function toggleFullscreen() {
              if (!document.fullscreenElement) {
                  if (video.requestFullscreen) {
                      video.requestFullscreen();
                  } else if (video.webkitRequestFullscreen) {
                      video.webkitRequestFullscreen();
                  }
              } else {
                  if (document.exitFullscreen) {
                      document.exitFullscreen();
                  }
              }
          }
          
          function downloadVideo() {
              const link = document.createElement('a');
              link.href = '${decodedVideoUrl}';
              link.download = 'heartscene-video.mp4';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              updateStatus('Download started');
          }
          
          function copyVideoLink() {
              navigator.clipboard.writeText('${decodedVideoUrl}').then(() => {
                  updateStatus('Link copied to clipboard!', 'success');
              }).catch(err => {
                  updateStatus('Failed to copy link', 'error');
              });
          }
          
          function updateStatus(message, type = 'info') {
              const icon = status.querySelector('i');
              status.innerHTML = \`\${icon.outerHTML} \${message}\`;
              
              // Update icon color based on type
              if (type === 'error') {
                  icon.style.color = '#ff416c';
              } else if (type === 'success') {
                  icon.style.color = '#4CAF50';
              } else if (type === 'warning') {
                  icon.style.color = '#FF9800';
              } else {
                  icon.style.color = '#2196F3';
              }
          }
          
          // Keyboard shortcuts
          document.addEventListener('keydown', (e) => {
              switch(e.key.toLowerCase()) {
                  case ' ':
                  case 'k':
                      e.preventDefault();
                      togglePlayPause();
                      break;
                  case 'm':
                      e.preventDefault();
                      toggleMute();
                      break;
                  case 'f':
                      e.preventDefault();
                      toggleFullscreen();
                      break;
                  case 'd':
                      e.preventDefault();
                      downloadVideo();
                      break;
              }
          });
          
          // Auto play attempt
          video.play().catch(e => {
              // Autoplay was prevented, show instruction
              updateStatus('Click the play button to start video', 'warning');
          });
      </script>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-cache'
    },
  });
}
