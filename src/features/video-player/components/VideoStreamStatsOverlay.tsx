'use client'

/**
 * Stream stats: info button + popover. Use `placement="controlBarEnd"` inside the control strip
 * or `placement="floatingOnPlayer"` for a corner overlay on the full player.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Popover, Stack, Typography } from '@mui/material';
import { InfoOutlined as StatsIcon } from '@mui/icons-material';

const READY_STATE_LABELS = [
  'HAVE_NOTHING',
  'HAVE_METADATA',
  'HAVE_CURRENT_DATA',
  'HAVE_FUTURE_DATA',
  'HAVE_ENOUGH_DATA',
] as const;

const NETWORK_STATE_LABELS = ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—';
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatBuffered(video: HTMLVideoElement): string {
  const { buffered } = video;
  if (!buffered.length) return '—';
  const parts: string[] = [];
  for (let i = 0; i < buffered.length; i += 1) {
    parts.push(`${buffered.start(i).toFixed(1)}–${buffered.end(i).toFixed(1)}s`);
  }
  return parts.join(', ');
}

function truncateUrl(url: string, max = 48): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

type StreamStatsRow = { label: string; value: string };

function useStreamStatsRows(
  video: HTMLVideoElement | null,
  active: boolean,
  playing: boolean,
  muted: boolean,
  volume: number,
  isLive: boolean
): StreamStatsRow[] {
  const [rows, setRows] = useState<StreamStatsRow[]>([]);
  const fpsRef = useRef({ t: 0, frames: 0 });

  useEffect(() => {
    if (!video || !active) {
      setRows([]);
      fpsRef.current = { t: 0, frames: 0 };
      return;
    }

    const tick = () => {
      const q = video.getVideoPlaybackQuality?.();
      const now = performance.now();
      let fpsStr = '—';
      if (q) {
        const prev = fpsRef.current;
        if (prev.t > 0 && now - prev.t > 50) {
          const df = q.totalVideoFrames - prev.frames;
          const dt = (now - prev.t) / 1000;
          if (dt > 0 && df >= 0) {
            fpsStr = `${(df / dt).toFixed(1)} fps`;
          }
        }
        fpsRef.current = { t: now, frames: q.totalVideoFrames };
      }

      const readyLabel = READY_STATE_LABELS[video.readyState] ?? String(video.readyState);
      const netLabel = NETWORK_STATE_LABELS[video.networkState] ?? String(video.networkState);
      const duration = video.duration;
      const durationStr =
        !Number.isFinite(duration) || duration === Infinity ? (isLive ? 'Live' : '—') : formatTime(duration);
      const src = video.currentSrc || video.src || '—';

      setRows([
        { label: 'Intrinsic size', value: `${video.videoWidth}×${video.videoHeight}` },
        { label: 'Display size', value: `${video.clientWidth}×${video.clientHeight}` },
        { label: 'Frame rate (est.)', value: fpsStr },
        {
          label: 'Frames (dropped / total)',
          value: q ? `${q.droppedVideoFrames} / ${q.totalVideoFrames}` : '—',
        },
        { label: 'Playback', value: playing ? 'Playing' : 'Paused' },
        { label: 'Position / duration', value: `${formatTime(video.currentTime)} / ${durationStr}` },
        { label: 'Playback rate', value: `${video.playbackRate.toFixed(2)}×` },
        { label: 'Volume', value: muted ? 'Muted' : `${Math.round(volume * 100)}%` },
        { label: 'Ready state', value: readyLabel },
        { label: 'Network state', value: netLabel },
        { label: 'Buffered', value: formatBuffered(video) },
        { label: 'Source', value: truncateUrl(src, 56) },
      ]);
    };

    tick();
    const id = window.setInterval(tick, 500);
    return () => {
      window.clearInterval(id);
      fpsRef.current = { t: 0, frames: 0 };
    };
  }, [video, active, playing, muted, volume, isLive]);

  return rows;
}

export type VideoStreamStatsPlacement = 'controlBarEnd' | 'floatingOnPlayer';

export interface VideoStreamStatsOverlayProps {
  video: HTMLVideoElement | null;
  playing: boolean;
  muted: boolean;
  volume: number;
  isLive: boolean;
  /** When false, nothing is rendered. */
  visible: boolean;
  /** `controlBarEnd`: right end of the control bar row. `floatingOnPlayer`: bottom-right over the player. */
  placement?: VideoStreamStatsPlacement;
  /**
   * Only for `floatingOnPlayer`: extra px from bottom (e.g. clear a bottom control strip).
   */
  bottomOffset?: number;
}

export const VideoStreamStatsOverlay: React.FC<VideoStreamStatsOverlayProps> = ({
  video,
  playing,
  muted,
  volume,
  isLive,
  visible,
  placement = 'controlBarEnd',
  bottomOffset = 0,
}) => {
  const [statsAnchor, setStatsAnchor] = useState<HTMLElement | null>(null);
  const statsOpen = Boolean(statsAnchor);
  const statsRows = useStreamStatsRows(video, statsOpen, playing, muted, volume, isLive);

  if (!visible) return null;

  const floating = placement === 'floatingOnPlayer';

  return (
    <Box
      sx={(theme) =>
        floating
          ? {
              position: 'absolute',
              right: theme.spacing(1),
              bottom: `calc(${theme.spacing(1)} + ${bottomOffset}px)`,
              zIndex: 6,
              pointerEvents: 'auto',
            }
          : {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexShrink: 0,
            }
      }
    >
      <IconButton
        color="inherit"
        size="small"
        disabled={!video}
        onClick={(e) => setStatsAnchor((prev) => (prev ? null : e.currentTarget))}
        aria-label="Stream statistics"
        aria-expanded={statsOpen}
        aria-haspopup="true"
        sx={
          floating
            ? {
                color: 'common.white',
                bgcolor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(6px)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.72)' },
                '&.Mui-disabled': { color: 'grey.600' },
              }
            : undefined
        }
      >
        <StatsIcon fontSize="small" />
      </IconButton>
      <Popover
        open={statsOpen}
        anchorEl={statsAnchor}
        onClose={() => setStatsAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
        PaperProps={{
          sx: {
            px: 2,
            py: 1.5,
            maxWidth: 380,
            bgcolor: 'rgba(24, 24, 24, 0.98)',
            color: 'common.white',
            border: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Stream stats
        </Typography>
        <Stack spacing={0.75}>
          {statsRows.map((row) => (
            <Box
              key={row.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                alignItems: 'baseline',
              }}
            >
              <Typography variant="caption" sx={{ color: 'grey.400', flexShrink: 0 }}>
                {row.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', textAlign: 'right', wordBreak: 'break-all' }}
              >
                {row.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Popover>
    </Box>
  );
};
