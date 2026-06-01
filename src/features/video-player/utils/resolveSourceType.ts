import type { VideoSourceType } from '../types';

export function resolveSourceType(src: string, sourceType: VideoSourceType): 'hls' | 'mp4' {
  if (sourceType === 'hls') return 'hls';
  if (sourceType === 'mp4') return 'mp4';
  if (sourceType === 'webrtc') return 'mp4';
  const lower = src.split('?')[0].toLowerCase();
  if (lower.endsWith('.m3u8')) return 'hls';
  return 'mp4';
}

export function isSafariNativeHls(video: HTMLVideoElement): boolean {
  return video.canPlayType('application/vnd.apple.mpegurl') !== '';
}
