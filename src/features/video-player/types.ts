/**
 * @file types.ts
 * @description Prop and config types for the modular video player (flat / 360, HLS, MP4, WebRTC).
 */

import type { CSSProperties, VideoHTMLAttributes } from 'react';
import type { HlsConfig } from 'hls.js';

export type VideoSourceType = 'auto' | 'mp4' | 'hls' | 'webrtc';

/** URL-based playback (HLS / MP4 via `src`) vs WHEP WebRTC when both are configured. */
export type VideoStreamTransport = 'hls' | 'webrtc';

export type VideoViewMode = 'flat' | '360';

export type ControlBarPosition = 'left' | 'right' | 'top' | 'bottom';

/** Which built-in controls render; all default to true when omitted. */
export interface VideoPlayerControlsVisibility {
  playPause?: boolean;
  volume?: boolean;
  viewModeToggle?: boolean;
  liveIndicator?: boolean;
  /** Stream / playback diagnostics (resolution, estimated FPS, etc.). */
  streamStats?: boolean;
  /** HLS vs WebRTC toggle when both `src` and `webrtc.whepUrl` are set (no extra UI otherwise). */
  transportToggle?: boolean;
}

export interface WebRTCPlaybackOptions {
  /** WHEP-style endpoint: POST SDP offer, response body is SDP answer. */
  whepUrl?: string;
  iceServers?: RTCIceServer[];
}

export interface ModularVideoPlayerProps {
  /** Direct file or playlist URL (MP4, HLS `.m3u8`, etc.). */
  src?: string;
  /** When set, takes precedence over `src` for playback (e.g. your own `RTCPeerConnection`). */
  mediaStream?: MediaStream | null;
  /** How to interpret `src` when `mediaStream` is not set. */
  sourceType?: VideoSourceType;
  /** Live streams (HLS / WebRTC); shows optional live badge when enabled in controls. */
  isLive?: boolean;

  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;

  /** Equirectangular 360 vs standard flat video. */
  viewMode?: VideoViewMode;
  defaultViewMode?: VideoViewMode;
  onViewModeChange?: (mode: VideoViewMode) => void;

  controlBarPosition?: ControlBarPosition;
  /** When false, no default control bar is rendered (fully custom UI outside). */
  showControlBar?: boolean;
  controls?: VideoPlayerControlsVisibility;

  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;

  volume?: number;
  defaultVolume?: number;
  onVolumeChange?: (volume: number) => void;

  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;

  webrtc?: WebRTCPlaybackOptions;
  hlsConfig?: Partial<HlsConfig>;

  /**
   * Active transport when both `src` and `webrtc.whepUrl` exist.
   * Omit for internal state; use with `onStreamTransportChange` for controlled mode.
   */
  streamTransport?: VideoStreamTransport;
  /** Initial transport in dual-source mode (default `hls`). */
  defaultStreamTransport?: VideoStreamTransport;
  onStreamTransportChange?: (transport: VideoStreamTransport) => void;

  /** Sensitivity for 360 mouse look (yaw / pitch). */
  lookSensitivity?: number;
  /** Sensitivity for roll (Shift + drag or right mouse button). */
  rollSensitivity?: number;

  onError?: (error: Error) => void;
  onLoadedMetadata?: (video: HTMLVideoElement) => void;

  videoProps?: VideoHTMLAttributes<HTMLVideoElement>;
}
