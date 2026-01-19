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
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player - HeartScene</title>
    <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: white;
      }
      
      .container {
        width: 100%;
        max-width: 1000px;
        text-align: center;
      }
      
      .header {
        margin-bottom: 30px;
      }
      
      .logo {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 10px;
        color: #ff6b6b;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
      }
      
      .player-container {
        background: rgba(0, 0, 0, 0.8);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        margin-bottom: 30px;
      }
      
      .video-js {
        width: 100% !important;
        height: 70vh !important;
      }
      
      .alternative-options {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 25px;
        margin-top: 20px;
        text-align: left;
      }
      
      .alternative-options h3 {
        margin-bottom: 15px;
        color: #ffd93d;
        border-bottom: 2px solid #ffd93d;
        padding-bottom: 8px;
      }
      
      .option {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: transform 0.3s ease;
      }
      
      .option:hover {
        transform: translateX(10px);
        background: rgba(255, 255, 255, 0.1);
      }
      
      .option-text {
        flex: 1;
      }
      
      .option-title {
        font-weight: bold;
        margin-bottom: 5px;
        color: #6bc5ff;
      }
      
      .option-desc {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
      }
      
      .btn {
        background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
      }
      
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
      }
      
      .btn-secondary {
        background: linear-gradient(45deg, #4ecdc4, #6fffe0);
      }
      
      .btn-tertiary {
        background: linear-gradient(45deg, #556270, #4ecdc4);
      }
      
      .error-message {
        background: rgba(255, 107, 107, 0.2);
        border-left: 5px solid #ff6b6b;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: left;
      }
      
      .error-message h3 {
        color: #ff6b6b;
        margin-bottom: 10px;
      }
      
      @media (max-width: 768px) {
        .video-js {
          height: 50vh !important;
        }
        
        .option {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .btn {
          margin-top: 10px;
          width: 100%;
          justify-content: center;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">
          🎬 HeartScene Video Player
        </div>
        <p>Professional Video Streaming Platform</p>
      </div>
      
      <div class="error-message" id="errorMessage" style="display: none;">
        <h3><i class="fas fa-exclamation-triangle"></i> Player Error</h3>
        <p id="errorText">The video cannot be played directly due to restrictions. Please use alternative options below.</p>
      </div>
      
      <div class="player-container">
        <video
          id="my-video"
          class="video-js vjs-default-skin vjs-big-play-centered"
          controls
          preload="auto"
          data-setup='{}'
        >
          <source src="${decodedVideoUrl}" type="video/mp4" />
          <p class="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a
            web browser that
            <a href="https://videojs.com/html5-video-support/" target="_blank"
              >supports HTML5 video</a
            >
          </p>
        </video>
      </div>
      
      <div class="alternative-options">
        <h3><i class="fas fa-sync-alt"></i> Alternative Ways to View</h3>
        
        <div class="option">
          <div class="option-text">
            <div class="option-title">Download Video</div>
            <div class="option-desc">Save the video to your device and play it locally</div>
          </div>
          <a href="${decodedVideoUrl}" download="heartscene-video.mp4" class="btn">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
        
        <div class="option">
          <div class="option-text">
            <div class="option-title">Open in New Tab</div>
            <div class="option-desc">Try opening the video directly in a new browser tab</div>
          </div>
          <a href="${decodedVideoUrl}" target="_blank" class="btn btn-secondary">
            <i class="fas fa-external-link-alt"></i> Open Video
          </a>
        </div>
        
        <div class="option">
          <div class="option-text">
            <div class="option-title">Copy Video Link</div>
            <div class="option-desc">Copy the direct video URL to use in other players</div>
          </div>
          <button onclick="copyVideoUrl()" class="btn btn-tertiary">
            <i class="fas fa-copy"></i> Copy URL
          </button>
        </div>
        
        <div class="option">
          <div class="option-text">
            <div class="option-title">Use VLC Media Player</div>
            <div class="option-desc">Copy this link and paste in VLC: Media → Open Network Stream</div>
          </div>
          <button onclick="copyForVLC()" class="btn">
            <i class="fas fa-tv"></i> Copy for VLC
          </button>
        </div>
      </div>
    </div>

    <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
    <script>
      const videoUrl = "${decodedVideoUrl}";
      const videoPlayer = videojs('my-video');
      
      // Cek jika video gagal dimuat
      videoPlayer.on('error', function() {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorText').innerHTML = 
          'The video cannot be played directly due to TikTok restrictions. This is because TikTok uses DRM protection that prevents playback from other domains.';
      });
      
      // Coba play video
      videoPlayer.ready(function() {
        this.play().catch(function(error) {
          console.log('Autoplay prevented:', error);
          document.getElementById('errorMessage').style.display = 'block';
        });
      });
      
      function copyVideoUrl() {
        navigator.clipboard.writeText(videoUrl).then(function() {
          alert('Video URL copied to clipboard!');
        }).catch(function() {
          // Fallback untuk browser lama
          const textArea = document.createElement('textarea');
          textArea.value = videoUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Video URL copied to clipboard!');
        });
      }
      
      function copyForVLC() {
        const vlcUrl = videoUrl.replace(/^https?/, 'https');
        navigator.clipboard.writeText(vlcUrl).then(function() {
          alert('URL copied for VLC! Open VLC → Media → Open Network Stream → Paste URL');
        });
      }
      
      // Cek kode error
      videoPlayer.on('loadeddata', function() {
        console.log('Video loaded successfully');
        document.getElementById('errorMessage').style.display = 'none';
      });
      
      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
          case ' ':
            e.preventDefault();
            if (videoPlayer.paused()) {
              videoPlayer.play();
            } else {
              videoPlayer.pause();
            }
            break;
          case 'f':
            if (videoPlayer.isFullscreen()) {
              videoPlayer.exitFullscreen();
            } else {
              videoPlayer.requestFullscreen();
            }
            break;
          case 'm':
            videoPlayer.muted(!videoPlayer.muted());
            break;
          case 'd':
            window.open(videoUrl, '_blank');
            break;
        }
      });
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  </body>
  </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}
