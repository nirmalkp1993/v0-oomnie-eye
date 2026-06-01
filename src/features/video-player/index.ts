/**
 * @file index.ts
 * @description Barrel export for the modular video player feature.
 */

export { ModularVideoPlayer } from './components/ModularVideoPlayer';
export { PatrolStyleVideoPlayer } from './components/PatrolStyleVideoPlayer';
export type { PatrolStyleVideoPlayerProps, PatrolPlayerViewMode } from './components/PatrolStyleVideoPlayer';
export { Video360Canvas } from './components/Video360Canvas';
export { VideoPlayerControlBar, mergeControlsVisibility } from './components/VideoPlayerControlBar';
export { useVideoSource } from './hooks/useVideoSource';
export { attachWhepPlayback } from './utils/whepPlayback';
export { upgradeInsecureMediaUrlForHttpsPage } from './utils/upgradeInsecureMediaUrlForHttpsPage';
export { resolveSourceType, isSafariNativeHls } from './utils/resolveSourceType';
export type {
  ModularVideoPlayerProps,
  VideoSourceType,
  VideoStreamTransport,
  VideoViewMode,
  ControlBarPosition,
  VideoPlayerControlsVisibility,
  WebRTCPlaybackOptions,
} from './types';
