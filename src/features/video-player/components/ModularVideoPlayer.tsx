'use client'

/**
 * @file ModularVideoPlayer.tsx
 * @description Modular player: MP4 / HLS / WebRTC (MediaStream or WHEP), flat or 360° with pointer look.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import type { ModularVideoPlayerProps, VideoStreamTransport, VideoViewMode } from '../types';
import { useVideoSource } from '../hooks/useVideoSource';
import { Video360Canvas } from './Video360Canvas';
import { mergeControlsVisibility, VideoPlayerControlBar } from './VideoPlayerControlBar';

export const ModularVideoPlayer: React.FC<ModularVideoPlayerProps> = ({
  src,
  mediaStream = null,
  sourceType = 'auto',
  isLive = false,
  width = '100%',
  height = 360,
  className,
  style,
  viewMode: viewModeControlled,
  defaultViewMode = 'flat',
  onViewModeChange,
  controlBarPosition = 'bottom',
  showControlBar = true,
  controls,
  playing: playingControlled,
  defaultPlaying = false,
  onPlayingChange,
  volume: volumeControlled,
  defaultVolume = 1,
  onVolumeChange,
  muted: mutedControlled,
  defaultMuted = false,
  onMutedChange,
  webrtc,
  hlsConfig,
  streamTransport: streamTransportControlled,
  defaultStreamTransport = 'hls',
  onStreamTransportChange,
  lookSensitivity,
  rollSensitivity,
  onError,
  onLoadedMetadata,
  videoProps,
}) => {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  const whepUrlRaw = webrtc?.whepUrl?.trim();
  const srcTrimmed = src?.trim() ?? '';
  const dualTransportAvailable = Boolean(srcTrimmed && whepUrlRaw);

  const [internalTransport, setInternalTransport] =
    useState<VideoStreamTransport>(defaultStreamTransport);
  const streamTransport = streamTransportControlled ?? internalTransport;

  const sourceFingerprint = `${src ?? ''}\0${webrtc?.whepUrl ?? ''}`;
  const prevFingerprintRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevFingerprintRef.current === null) {
      prevFingerprintRef.current = sourceFingerprint;
      return;
    }
    if (prevFingerprintRef.current === sourceFingerprint) return;
    prevFingerprintRef.current = sourceFingerprint;
    if (streamTransportControlled === undefined) {
      setInternalTransport(defaultStreamTransport);
    }
  }, [sourceFingerprint, streamTransportControlled, defaultStreamTransport]);

  const setStreamTransport = useCallback(
    (t: VideoStreamTransport) => {
      if (streamTransportControlled === undefined) setInternalTransport(t);
      onStreamTransportChange?.(t);
    },
    [streamTransportControlled, onStreamTransportChange]
  );

  const effectiveWhepUrl = dualTransportAvailable
    ? streamTransport === 'webrtc'
      ? whepUrlRaw
      : undefined
    : whepUrlRaw || undefined;

  const effectiveSrc = dualTransportAvailable
    ? streamTransport === 'hls'
      ? src
      : undefined
    : src;

  const liveForControlBar = isLive || Boolean(effectiveWhepUrl);

  const [internalView, setInternalView] = useState<VideoViewMode>(defaultViewMode);
  const viewMode = viewModeControlled ?? internalView;
  const setViewMode = useCallback(
    (m: VideoViewMode) => {
      if (viewModeControlled === undefined) setInternalView(m);
      onViewModeChange?.(m);
    },
    [viewModeControlled, onViewModeChange]
  );

  const [internalPlaying, setInternalPlaying] = useState(defaultPlaying);
  const playing = playingControlled ?? internalPlaying;
  const setPlaying = useCallback(
    (p: boolean) => {
      if (playingControlled === undefined) setInternalPlaying(p);
      onPlayingChange?.(p);
    },
    [playingControlled, onPlayingChange]
  );

  const [internalVol, setInternalVol] = useState(defaultVolume);
  const volume = volumeControlled ?? internalVol;
  const setVolume = useCallback(
    (v: number) => {
      if (volumeControlled === undefined) setInternalVol(v);
      onVolumeChange?.(v);
    },
    [volumeControlled, onVolumeChange]
  );

  const [internalMuted, setInternalMuted] = useState(defaultMuted);
  const muted = mutedControlled ?? internalMuted;
  const setMuted = useCallback(
    (m: boolean) => {
      if (mutedControlled === undefined) setInternalMuted(m);
      onMutedChange?.(m);
    },
    [mutedControlled, onMutedChange]
  );

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useVideoSource({
    video: videoEl,
    src: effectiveSrc,
    mediaStream,
    whepUrl: effectiveWhepUrl,
    webrtcIceServers: webrtc?.iceServers,
    sourceType,
    hlsConfig,
    onError: (e) => onErrorRef.current?.(e),
  });

  const playbackKey = useMemo(
    () =>
      [
        effectiveSrc ?? '',
        effectiveWhepUrl ?? '',
        mediaStream ? 'mediastream' : '',
      ].join('\0'),
    [effectiveSrc, effectiveWhepUrl, mediaStream]
  );

  const hasPlaybackTarget = Boolean(
    (effectiveSrc && effectiveSrc.trim()) ||
      (effectiveWhepUrl && effectiveWhepUrl.trim()) ||
      mediaStream
  );

  const [streamReadyToShow, setStreamReadyToShow] = useState(false);

  useEffect(() => {
    const v = videoEl;
    if (!v || !hasPlaybackTarget) {
      setStreamReadyToShow(false);
      return;
    }

    setStreamReadyToShow(false);

    const markReady = () => {
      setStreamReadyToShow(true);
    };

    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
      return undefined;
    }

    const onError = () => markReady();

    v.addEventListener('loadeddata', markReady);
    v.addEventListener('canplay', markReady);
    v.addEventListener('playing', markReady);
    v.addEventListener('error', onError);

    return () => {
      v.removeEventListener('loadeddata', markReady);
      v.removeEventListener('canplay', markReady);
      v.removeEventListener('playing', markReady);
      v.removeEventListener('error', onError);
    };
  }, [videoEl, playbackKey, hasPlaybackTarget]);

  useEffect(() => {
    const v = videoEl;
    if (!v) return;
    const onMeta = () => onLoadedMetadata?.(v);
    const onVidError = () => {
      const err = v.error;
      onErrorRef.current?.(new Error(err?.message || 'Video error'));
    };
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('error', onVidError);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('error', onVidError);
    };
  }, [videoEl, onLoadedMetadata]);

  useEffect(() => {
    const v = videoEl;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [videoEl, volume, muted]);

  useEffect(() => {
    const v = videoEl;
    if (!v) return;
    if (!playing) {
      v.pause();
      return;
    }
    const tryPlay = () => {
      void v.play().catch((e) => onErrorRef.current?.(e instanceof Error ? e : new Error(String(e))));
    };
    tryPlay();
    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return undefined;
    v.addEventListener('canplay', tryPlay, { once: true });
    return () => v.removeEventListener('canplay', tryPlay);
  }, [videoEl, playing, effectiveSrc, effectiveWhepUrl, mediaStream]);

  useEffect(() => {
    const v = videoEl;
    if (!v) return;
    const onPlay = () => {
      if (playingControlled === undefined) setInternalPlaying(true);
      onPlayingChange?.(true);
    };
    const onPause = () => {
      if (playingControlled === undefined) setInternalPlaying(false);
      onPlayingChange?.(false);
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [videoEl, playingControlled, onPlayingChange]);

  const mergedControls = mergeControlsVisibility(controls);

  const togglePlay = useCallback(() => {
    setPlaying(!playing);
  }, [playing, setPlaying]);

  const toggleView = useCallback(() => {
    setViewMode(viewMode === '360' ? 'flat' : '360');
  }, [viewMode, setViewMode]);

  const flexDirection: 'row' | 'column' =
    controlBarPosition === 'top' || controlBarPosition === 'bottom' ? 'column' : 'row';

  const barFirst = controlBarPosition === 'top' || controlBarPosition === 'left';

  const controlBar = showControlBar ? (
    <VideoPlayerControlBar
      controls={mergedControls}
      video={videoEl}
      playing={playing}
      onPlayPause={togglePlay}
      viewMode={viewMode}
      onToggleViewMode={toggleView}
      volume={volume}
      muted={muted}
      onVolumeChange={(v) => {
        setVolume(v);
        if (v > 0 && muted) setMuted(false);
      }}
      onMutedToggle={() => setMuted(!muted)}
      isLive={liveForControlBar}
      showStreamTransportToggle={dualTransportAvailable && mergedControls.transportToggle}
      streamTransport={streamTransport}
      onStreamTransportChange={dualTransportAvailable ? setStreamTransport : undefined}
    />
  ) : null;

  const { crossOrigin: crossOriginProp, playsInline = true, ...restVideo } = videoProps ?? {};
  /** Flat playback does not need CORS; `anonymous` breaks many cross-origin MP4s. 360° / WebGL does. */
  const crossOrigin =
    crossOriginProp !== undefined ? crossOriginProp : viewMode === '360' ? 'anonymous' : undefined;

  const videoNode = (
    <video
      ref={(el) => setVideoEl(el)}
      playsInline={playsInline}
      crossOrigin={crossOrigin}
      {...restVideo}
      style={{
        width: viewMode === '360' ? 2 : '100%',
        height: viewMode === '360' ? 2 : '100%',
        objectFit: viewMode === '360' ? undefined : 'cover',
        position: viewMode === '360' ? 'absolute' : 'relative',
        opacity: viewMode === '360' ? 0 : 1,
        pointerEvents: viewMode === '360' ? 'none' : 'auto',
        bottom: viewMode === '360' ? 0 : undefined,
        right: viewMode === '360' ? 0 : undefined,
        ...restVideo.style,
      }}
    />
  );

  const stage = (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        bgcolor: 'black',
        overflow: 'hidden',
      }}
    >
      {videoNode}
      {viewMode === '360' && videoEl ? (
        <Video360Canvas
          video={videoEl}
          active={viewMode === '360'}
          lookSensitivity={lookSensitivity}
          rollSensitivity={rollSensitivity}
        />
      ) : null}
      {hasPlaybackTarget && !streamReadyToShow ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}
          aria-busy
          aria-label="Loading stream"
        >
          <CircularProgress size={40} sx={{ color: 'common.white' }} />
        </Box>
      ) : null}
    </Box>
  );

  return (
    <Box
      className={className}
      style={style}
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection,
      }}
    >
      {barFirst && controlBar}
      {stage}
      {!barFirst && controlBar}
    </Box>
  );
};
