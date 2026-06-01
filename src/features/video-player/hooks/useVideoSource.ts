import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import type { VideoSourceType } from '../types';
import { isSafariNativeHls, resolveSourceType } from '../utils/resolveSourceType';
import { attachWhepPlayback } from '../utils/whepPlayback';
import { upgradeInsecureMediaUrlForHttpsPage } from '../utils/upgradeInsecureMediaUrlForHttpsPage';
import type { HlsConfig } from 'hls.js';

export interface UseVideoSourceParams {
  video: HTMLVideoElement | null;
  src?: string;
  mediaStream?: MediaStream | null;
  whepUrl?: string;
  webrtcIceServers?: RTCIceServer[];
  sourceType: VideoSourceType;
  hlsConfig?: Partial<HlsConfig>;
  onError?: (error: Error) => void;
}

export function useVideoSource(params: UseVideoSourceParams): void {
  const { video, src, mediaStream, whepUrl, webrtcIceServers, sourceType, hlsConfig, onError } =
    params;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const el = video;
    if (!el) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const report = (e: unknown) => {
      onErrorRef.current?.(e instanceof Error ? e : new Error(String(e)));
    };

    const run = async () => {
      try {
        el.pause();
        el.removeAttribute('src');
        el.srcObject = null;

        const playSrc = src ? upgradeInsecureMediaUrlForHttpsPage(src) : undefined;
        const playWhep = whepUrl ? upgradeInsecureMediaUrlForHttpsPage(whepUrl) : undefined;

        if (mediaStream) {
          el.srcObject = mediaStream;
          cleanup = () => {
            el.srcObject = null;
          };
          return;
        }

        if (playWhep) {
          cleanup = await attachWhepPlayback(el, playWhep, webrtcIceServers);
          return;
        }

        if (!playSrc) {
          return;
        }

        if (sourceType === 'webrtc') {
          report(new Error('WebRTC requires mediaStream or webrtc.whepUrl'));
          return;
        }

        const kind = resolveSourceType(playSrc, sourceType);

        if (kind === 'hls') {
          if (Hls.isSupported()) {
            const hls = new Hls({ ...hlsConfig });
            hls.loadSource(playSrc);
            hls.attachMedia(el);
            hls.on(Hls.Events.ERROR, (_e, data) => {
              if (data.fatal) report(new Error(data.details || 'HLS fatal error'));
            });
            cleanup = () => {
              hls.destroy();
            };
            return;
          }

          if (isSafariNativeHls(el)) {
            el.src = playSrc;
            cleanup = () => {
              el.removeAttribute('src');
            };
            return;
          }

          report(new Error('HLS is not supported in this browser'));
          return;
        }

        el.src = playSrc;
        cleanup = () => {
          el.removeAttribute('src');
        };
      } catch (e) {
        if (!cancelled) report(e);
      }
    };

    void run();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [video, src, mediaStream, whepUrl, webrtcIceServers, sourceType, hlsConfig]);
}
