import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export const VideoPlayer = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady } = props;

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video");
      videoElement.className = "video-js";
      videoElement.controls = true;
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, {
        ...options,
        controls: true,
        fluid: true,
      }, () => {
        videojs.log('Player is ready');
        onReady && onReady(player);
      }));

      player.on('error', (event) => {
        console.error('Video Player Error:', event);
        alert(`Video Player Error: ${event.type}`);
      });
    } else {
      const player = playerRef.current;
      player.src(options.sources);
      player.autoplay(options.autoplay);
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options, onReady]);

  return (
    <div data-vjs-player style={{ width: "700px", padding: "10px" }}>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoPlayer;
