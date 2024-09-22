import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export const VideoPlayer = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady } = props;

  useEffect(() => {
    if (!playerRef.current) {
      console.log("Creating Video.js player...");

      // Create video element
      const videoElement = document.createElement("video");
      videoElement.className = "video-js";
      videoElement.controls = true;
      videoRef.current.appendChild(videoElement);

      // Initialize Video.js player
      const player = (playerRef.current = videojs(videoElement, {
        ...options,
        controls: true,
        fluid: true,
      }, () => {
        videojs.log('Player is ready');
        onReady && onReady(player);
      }));

      // Event listener for player errors
      player.on('error', (event) => {
        console.error('Video Player Error:', event);
        const error = player.error();
        console.error("Error code:", error.code);
        alert(`Video Player Error: ${event.type}`);
      });

      // Debugging video player events
      player.on('play', () => console.log("Video is playing"));
      player.on('pause', () => console.log("Video is paused"));
      player.on('ended', () => console.log("Video has ended"));
      player.on('loadstart', () => console.log("Video loading started"));
      player.on('loadeddata', () => console.log("Video data loaded"));
      player.on('waiting', () => console.log("Video is waiting for more data"));

    } else {
      console.log("Reusing existing Video.js player...");
      const player = playerRef.current;
      player.src(options.sources);
      player.autoplay(options.autoplay);
    }

    return () => {
      console.log("Disposing Video.js player...");
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
