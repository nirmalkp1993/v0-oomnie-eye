'use client'

import { useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import type { Recording } from '@/types/camera'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

interface Props {
  cameraId: string | null
}

export function CameraRecordingHistoryPanel({ cameraId }: Props) {
  const cameras = useCameraStore((s) => s.cameras)
  const recordings = useCameraStore((s) => s.recordings)

  const [date, setDate] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [playingRecording, setPlayingRecording] = useState<Recording | null>(null)

  const selectedCamera = useMemo(
    () => (cameraId ? cameras.find((c) => c.id === cameraId) ?? null : null),
    [cameraId, cameras],
  )

  useEffect(() => {
    setPage(0)
    setPlayingRecording(null)
    setDate('')
    setSearch('')
  }, [cameraId])

  const allForCamera = useMemo(() => {
    if (!cameraId) return []
    return recordings.filter((r) => r.cameraId === cameraId)
  }, [cameraId, recordings])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allForCamera.filter((r) => {
      if (date && r.startDate !== date) return false
      if (q && !r.scheduleName.toLowerCase().includes(q) && !r.filePath.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [allForCamera, date, search])

  const paged = useMemo(() => {
    const start = page * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const filterSummary = selectedCamera?.name ?? 'no camera selected'

  const handleDateChange = (next: string) => {
    setDate(next)
    setPage(0)
    setPlayingRecording(null)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  const handleRowClick = (row: Recording) => {
    setPlayingRecording(row)
  }

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            History
          </Typography>
          <Tooltip title="Recorded clips from storage folders. Select a camera on the left, then click a row to play.">
            <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box
          component="label"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            typography: 'body2',
            color: 'text.secondary',
          }}
        >
          <span>Date</span>
          <TextField
            type="date"
            size="small"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
            sx={{ width: 160 }}
          />
          {date ? (
            <Typography
              component="button"
              type="button"
              variant="caption"
              onClick={() => handleDateChange('')}
              sx={{
                border: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                color: 'primary.main',
                textDecoration: 'underline',
                '&:hover': { color: 'primary.dark' },
              }}
            >
              All dates
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.disabled">
            {filterSummary}
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search clips…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search recordings"
          sx={{ width: { xs: '100%', sm: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {playingRecording && selectedCamera ? (
          <Box
            sx={{
              mx: 2,
              mt: 2,
              mb: 1,
              p: 2,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {playingRecording.scheduleName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedCamera.name} · {playingRecording.startDate} · {playingRecording.duration} ·{' '}
                  {playingRecording.fileSize}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', color: 'text.secondary' }}
                >
                  {playingRecording.filePath}
                </Typography>
              </Box>
              <IconButton size="small" aria-label="Close player" onClick={() => setPlayingRecording(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box
              sx={{
                mt: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 160,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <PlayArrowOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Playback preview (mock)
              </Typography>
            </Box>
          </Box>
        ) : null}

        {!cameraId ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Select a camera in the group tree on the left to view its recording history.
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {search.trim()
                ? 'No clips match your search.'
                : `No recordings found for ${filterSummary}${date ? ` on ${date}` : ''}.`}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, minHeight: 0 }}>
            <Table size="small" stickyHeader aria-label="Recording history">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 96 }} />
                  <TableCell>Clip</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell align="right">Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((row) => {
                  const thumb = selectedCamera?.thumbnail
                  const selected = playingRecording?.id === row.id
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      selected={selected}
                      onClick={() => handleRowClick(row)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {thumb ? (
                          <Box
                            component="img"
                            src={thumb}
                            alt=""
                            sx={{
                              width: 80,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 0.5,
                              bgcolor: 'action.hover',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 80,
                              height: 48,
                              borderRadius: 0.5,
                              bgcolor: 'action.hover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              typography: 'caption',
                              color: 'text.disabled',
                            }}
                          >
                            —
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {row.scheduleName}
                      </TableCell>
                      <TableCell>{row.startDate}</TableCell>
                      <TableCell>{row.duration}</TableCell>
                      <TableCell align="right">{row.fileSize}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    colSpan={5}
                    count={filtered.length}
                    page={page}
                    onPageChange={(_, next) => setPage(next)}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10))
                      setPage(0)
                    }}
                    rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  )
}
