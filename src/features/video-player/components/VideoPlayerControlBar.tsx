'use client'

/**
 * Configurable control strip; visibility of each control is driven by props.
 */

import React from 'react';
import { Box, Chip, IconButton, Slider, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeMuteIcon,
  ViewInAr as View360Icon,
  VideoFile as ViewFlatIcon,
} from '@mui/icons-material';
import type { VideoPlayerControlsVisibility, VideoStreamTransport, VideoViewMode } from '../types';
import { VideoStreamStatsOverlay } from './VideoStreamStatsOverlay';

export interface VideoPlayerControlBarProps {
  controls: Required<VideoPlayerControlsVisibility>;
  video: HTMLVideoElement | null;
  playing: boolean;
  onPlayPause: () => void;
  viewMode: VideoViewMode;
  onToggleViewMode: () => void;
  volume: number;
  muted: boolean;
  onVolumeChange: (v: number) => void;
  onMutedToggle: () => void;
  isLive: boolean;
  /** When both HLS (`src`) and WebRTC (WHEP) are available, show this toggle. */
  showStreamTransportToggle?: boolean;
  streamTransport?: VideoStreamTransport;
  onStreamTransportChange?: (t: VideoStreamTransport) => void;
}

const defaults: Required<VideoPlayerControlsVisibility> = {
  playPause: true,
  volume: true,
  viewModeToggle: true,
  liveIndicator: true,
  streamStats: true,
  transportToggle: true,
};

export function mergeControlsVisibility(
  c?: VideoPlayerControlsVisibility
): Required<VideoPlayerControlsVisibility> {
  return { ...defaults, ...c };
}

export const VideoPlayerControlBar: React.FC<VideoPlayerControlBarProps> = ({
  controls,
  video,
  playing,
  onPlayPause,
  viewMode,
  onToggleViewMode,
  volume,
  muted,
  onVolumeChange,
  onMutedToggle,
  isLive,
  showStreamTransportToggle = false,
  streamTransport = 'hls',
  onStreamTransportChange,
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{
        width: '100%',
        flexWrap: 'wrap',
        px: 1,
        py: 0.75,
        bgcolor: 'rgba(0, 0, 0, 0.90)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: 'common.white',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        flexWrap="wrap"
        sx={{ flex: '1 1 auto', minWidth: 0, justifyContent: 'flex-start' }}
      >
        {controls.liveIndicator && isLive && (
          <Chip label="LIVE" size="small" color="error" sx={{ height: 24, fontWeight: 700 }} />
        )}
        {controls.transportToggle && showStreamTransportToggle && onStreamTransportChange && (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={streamTransport}
            onChange={(_, v: VideoStreamTransport | null) => {
              if (v != null) onStreamTransportChange(v);
            }}
            aria-label="Stream transport"
            sx={{
              '& .MuiToggleButton-root': {
                py: 0.25,
                px: 1,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'rgba(255,255,255,0.75)',
                borderColor: 'rgba(255,255,255,0.35)',
                '&.Mui-selected': {
                  color: 'common.white',
                  bgcolor: 'primary.dark',
                  borderColor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.main' },
                },
              },
            }}
          >
            <ToggleButton value="hls" aria-label="HLS">
              HLS
            </ToggleButton>
            <ToggleButton value="webrtc" aria-label="WebRTC">
              WebRTC
            </ToggleButton>
          </ToggleButtonGroup>
        )}
        {controls.playPause && (
          <IconButton color="inherit" size="small" onClick={onPlayPause} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        )}
        {controls.viewModeToggle && (
          <IconButton
            color="inherit"
            size="small"
            onClick={onToggleViewMode}
            aria-label={viewMode === '360' ? 'Flat mode' : '360 mode'}
          >
            {viewMode === '360' ? <ViewFlatIcon /> : <View360Icon />}
          </IconButton>
        )}
        {controls.volume && (
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120, flex: '0 1 140px' }}>
            <IconButton color="inherit" size="small" onClick={onMutedToggle} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
            </IconButton>
            <Slider
              size="small"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(_, v) => onVolumeChange(Array.isArray(v) ? (v[0] ?? 0) : v)}
              sx={{ ml: 1, color: 'common.white' }}
              aria-label="Volume"
            />
          </Box>
        )}
      </Stack>
      {controls.streamStats ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexShrink: 0,
            ml: 'auto',
          }}
        >
          <VideoStreamStatsOverlay
            placement="controlBarEnd"
            visible
            video={video}
            playing={playing}
            muted={muted}
            volume={volume}
            isLive={isLive}
          />
        </Box>
      ) : null}
    </Stack>
  );
};
