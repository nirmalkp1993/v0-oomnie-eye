'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  IconButton,
  Link,
  Typography,
} from '@mui/material'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined'
import {
  countCamerasInGroupSubtree,
  findCameraTableGroupNode,
  useCameraStore,
} from '@/lib/camera-store'
import { applyCameraListFilters } from '@/lib/explorer-list-table/camera-table'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import type { Camera, CameraGroup } from '@/types/camera'
import { enterpriseExplorerTileSx } from '@/src/components/enterprise'

function camGroupIds(c: Camera): string[] {
  return c.groupIds ?? []
}

function grpParentIds(g: CameraGroup): string[] {
  return g.parentGroupIds ?? []
}

function directChildCount(folderId: string, groups: CameraGroup[], cameras: Camera[]): number {
  const subfolders = groups.filter((g) => grpParentIds(g).includes(folderId)).length
  const cams = cameras.filter((c) => camGroupIds(c).includes(folderId)).length
  return subfolders + cams
}

function statusChipColor(status: Camera['status']): 'success' | 'warning' | 'error' {
  if (status === 'live') return 'success'
  if (status === 'connecting') return 'warning'
  return 'error'
}

function statusLabel(status: Camera['status']): string {
  if (status === 'live') return 'LIVE'
  if (status === 'connecting') return 'CONNECTING'
  return 'STOPPED'
}

export function CameraCardView() {
  const cameras = useCameraStore((s) => s.cameras)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const searchQuery = useCameraStore((s) => s.searchQuery)
  const getCameraTableTree = useCameraStore((s) => s.getCameraTableTree)
  const cardExplorerStack = useCameraStore((s) => s.cardExplorerStack)
  const pushCardExplorerFolder = useCameraStore((s) => s.pushCardExplorerFolder)
  const navigateCardExplorerToSegmentIndex = useCameraStore((s) => s.navigateCardExplorerToSegmentIndex)
  const setSelectedCamera = useCameraStore((s) => s.setSelectedCamera)

  const { filters } = useExplorerListTable()

  const currentFolderId =
    cardExplorerStack.length > 0 ? cardExplorerStack[cardExplorerStack.length - 1] : null

  const displayLevel = cardExplorerStack.length + 1

  const { folderCards, cameraCards } = useMemo(() => {
    const raw = getCameraTableTree()
    const filtered = applyCameraListFilters(
      raw.rootTrees,
      raw.rootCameras,
      filters,
      (groupId) => countCamerasInGroupSubtree(groupId, cameras, cameraGroups)
    )

    if (!currentFolderId) {
      return {
        folderCards: filtered.rootTrees.map((n) => n.group),
        cameraCards: filtered.rootCameras,
      }
    }

    const node = findCameraTableGroupNode(filtered.rootTrees, currentFolderId)
    if (!node) {
      return { folderCards: [] as CameraGroup[], cameraCards: [] as Camera[] }
    }

    return {
      folderCards: node.children.map((n) => n.group),
      cameraCards: node.cameras,
    }
  }, [getCameraTableTree, filters, currentFolderId, cameras, cameraGroups])

  const totalItems = folderCards.length + cameraCards.length

  const breadcrumbItems = useMemo(() => {
    const items: { label: string; index: number }[] = [{ label: 'Root', index: 0 }]
    cardExplorerStack.forEach((id, i) => {
      const g = cameraGroups.find((x) => x.id === id)
      items.push({ label: g?.name ?? id, index: i + 1 })
    })
    return items
  }, [cardExplorerStack, cameraGroups])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Breadcrumbs
        separator={<ChevronRightIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        {breadcrumbItems.map((item, i) => {
          const isLast = i === breadcrumbItems.length - 1
          if (isLast) {
            return (
              <Typography
                key={`${item.label}-${i}`}
                variant="body2"
                fontWeight={600}
                color="text.primary"
                noWrap
                sx={{ maxWidth: { xs: 200, sm: 320 } }}
              >
                {item.label}
              </Typography>
            )
          }
          return (
            <Link
              key={`${item.label}-${i}`}
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              color="text.secondary"
              onClick={() => navigateCardExplorerToSegmentIndex(item.index)}
              sx={{ maxWidth: { xs: 160, sm: 240 }, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {item.label}
            </Link>
          )
        })}
      </Breadcrumbs>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
            xl: 'repeat(6, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {folderCards.map((group) => {
          const n = directChildCount(group.id, cameraGroups, cameras)
          return (
            <Card
              key={group.id}
              elevation={0}
              role="button"
              tabIndex={0}
              onClick={() => pushCardExplorerFolder(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  pushCardExplorerFolder(group.id)
                }
              }}
              sx={enterpriseExplorerTileSx}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  height: 96,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) =>
                    `linear-gradient(180deg, ${theme.palette.action.hover} 0%, ${theme.palette.background.default} 100%)`,
                }}
              >
                <Box sx={{ position: 'absolute', left: 8, top: 8, display: 'flex', gap: 0.5 }}>
                  <Chip label={`L${displayLevel}`} size="small" color="warning" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <ExpandMoreIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  </Box>
                </Box>
                <VideocamOutlinedIcon sx={{ fontSize: 44, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap title={group.name}>
                  {group.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {n} item{n === 1 ? '' : 's'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11 }}>
                  Type: group
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, borderTop: 1, borderColor: 'divider', pt: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    G
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Camera group
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )
        })}

        {cameraCards.map((camera) => (
          <Card
            key={camera.id}
            elevation={0}
            sx={enterpriseExplorerTileSx}
            onClick={() => setSelectedCamera(camera)}
          >
            <Box sx={{ position: 'relative', height: { xs: 80, sm: 96 }, overflow: 'hidden', cursor: 'pointer' }}>
              <Box sx={{ position: 'absolute', left: 8, top: 8, zIndex: 2, display: 'flex', gap: 0.5 }}>
                <Chip label={`L${displayLevel}`} size="small" color="warning" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
              </Box>
              {camera.thumbnail ? (
                <Image src={camera.thumbnail} alt={camera.name} fill className="object-cover" />
              ) : (
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                  <MonitorOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                </Box>
              )}
              <Chip
                label={statusLabel(camera.status)}
                size="small"
                color={statusChipColor(camera.status)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  zIndex: 2,
                  height: 18,
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, p: 1 }}>
                <Typography variant="caption" fontWeight={600} color="common.white" noWrap>
                  {camera.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 10 }} noWrap>
                  {camera.ip}
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {camera.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Items —
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11 }}>
                Type: camera
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pt: 0.5 }}>
                <Chip label={camera.type} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, borderColor: 'primary.light', color: 'primary.main' }} />
                <IconButton
                  size="small"
                  aria-label="Camera settings"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCamera(camera)
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, borderTop: 1, borderColor: 'divider', pt: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'secondary.main',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  C
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Camera
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {totalItems === 0 && (
        <Box
          sx={{
            display: 'flex',
            height: 176,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <VideocamOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This folder is empty
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {searchQuery.trim()
                ? 'No groups or cameras match your search here.'
                : 'Open another folder from the path above or add cameras and groups.'}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}
