'use client'

import { useMemo } from 'react'
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  Link,
  Typography,
} from '@mui/material'
import {
  useReportPlacemarkStore,
  REPORT_PIN_TAB_LABEL,
} from '@/lib/report-placemark-store'
import {
  countPlacemarksInGroupSubtree,
  findReportTableGroupNode,
} from '@/lib/report-group-tree'
import { applyReportListFilters } from '@/lib/explorer-list-table/report-table'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import type { ReportGroup, ReportPlacemark } from '@/types/report-placemark'
import { enterpriseExplorerTileSx } from '@/src/components/enterprise'
import {
  CameraAltOutlined as CameraIcon,
  ChevronRight,
  ExpandMore,
  MapOutlined as MapPinnedIcon,
} from '@mui/icons-material'
import { ReportPinGlyph } from '@/components/report/report-pin-glyph'

function placemarkGroupIds(p: ReportPlacemark): string[] {
  return p.groupIds ?? []
}

function grpParentIds(g: ReportGroup): string[] {
  return g.parentGroupIds ?? []
}

function directChildCount(folderId: string, groups: ReportGroup[], placemarks: ReportPlacemark[]): number {
  const subfolders = groups.filter((g) => grpParentIds(g).includes(folderId)).length
  const pins = placemarks.filter((p) => placemarkGroupIds(p).includes(folderId)).length
  return subfolders + pins
}

export function ReportCardView() {
  const activePinType = useReportPlacemarkStore((s) => s.activePinType)
  const placemarksAll = useReportPlacemarkStore((s) => s.placemarks)
  const reportGroupsAll = useReportPlacemarkStore((s) => s.reportGroups)
  const searchQuery = useReportPlacemarkStore((s) => s.searchQuery)
  const getReportTableTree = useReportPlacemarkStore((s) => s.getReportTableTree)
  const reportCardExplorerStack = useReportPlacemarkStore((s) => s.reportCardExplorerStack)
  const pushReportCardExplorerFolder = useReportPlacemarkStore((s) => s.pushReportCardExplorerFolder)
  const navigateReportCardExplorerToSegmentIndex = useReportPlacemarkStore(
    (s) => s.navigateReportCardExplorerToSegmentIndex,
  )

  const { filters } = useExplorerListTable()

  const placemarks = useMemo(
    () => placemarksAll.filter((p) => p.pinType === activePinType),
    [placemarksAll, activePinType],
  )
  const reportGroups = useMemo(
    () => reportGroupsAll.filter((g) => g.pinType === activePinType),
    [reportGroupsAll, activePinType],
  )

  const currentFolderId =
    reportCardExplorerStack.length > 0
      ? reportCardExplorerStack[reportCardExplorerStack.length - 1]
      : null

  const displayLevel = reportCardExplorerStack.length + 1

  const { folderCards, placemarkCards } = useMemo(() => {
    const raw = getReportTableTree()
    const filtered = applyReportListFilters(
      raw.rootTrees,
      raw.rootPlacemarks,
      filters,
      (groupId) => countPlacemarksInGroupSubtree(groupId, placemarks, reportGroups)
    )

    if (!currentFolderId) {
      return {
        folderCards: filtered.rootTrees.map((n) => n.group),
        placemarkCards: filtered.rootPlacemarks,
      }
    }

    const node = findReportTableGroupNode(filtered.rootTrees, currentFolderId)
    if (!node) {
      return { folderCards: [] as ReportGroup[], placemarkCards: [] as ReportPlacemark[] }
    }

    return {
      folderCards: node.children.map((n) => n.group),
      placemarkCards: node.placemarks,
    }
  }, [getReportTableTree, filters, currentFolderId, placemarks, reportGroups])

  const totalItems = folderCards.length + placemarkCards.length

  const breadcrumbItems = useMemo(() => {
    const items: { id: string | null; label: string; index: number }[] = [
      { id: null, label: 'Root', index: 0 },
    ]
    reportCardExplorerStack.forEach((id, i) => {
      const g = reportGroups.find((x) => x.id === id)
      items.push({ id, label: g?.name ?? id, index: i + 1 })
    })
    return items
  }, [reportCardExplorerStack, reportGroups])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Breadcrumbs
        separator={<ChevronRight sx={{ fontSize: 14, color: 'text.secondary' }} />}
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
                color="text.primary"
                fontWeight={600}
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
              onClick={() => navigateReportCardExplorerToSegmentIndex(item.index)}
              sx={{
                maxWidth: { xs: 160, sm: 240 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: reportCardExplorerStack.length === 0 && item.index === 0 ? 600 : 400,
              }}
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
          const n = directChildCount(group.id, reportGroups, placemarks)
          return (
            <Card
              key={group.id}
              elevation={0}
              role="button"
              tabIndex={0}
              onClick={() => pushReportCardExplorerFolder(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  pushReportCardExplorerFolder(group.id)
                }
              }}
              sx={enterpriseExplorerTileSx}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  height: 96,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) =>
                    `linear-gradient(180deg, ${theme.palette.action.hover} 0%, ${theme.palette.background.default} 100%)`,
                }}
              >
                <Box sx={{ position: 'absolute', left: 8, top: 8, display: 'flex', gap: 0.5 }}>
                  <Chip
                    label={`L${displayLevel}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: 'warning.light',
                      color: 'warning.contrastText',
                      border: 1,
                      borderColor: 'warning.main',
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      size: 20,
                      width: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <ExpandMore sx={{ fontSize: 12, color: 'text.secondary' }} />
                  </Box>
                </Box>
                <CameraIcon sx={{ fontSize: 44, color: 'primary.main' }} />
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
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                    pt: 1,
                  }}
                >
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
                    Report group
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )
        })}

        {placemarkCards.map((p) => (
          <Card key={p.id} elevation={0} sx={enterpriseExplorerTileSx}>
            <Box sx={{ position: 'relative', height: { xs: 80, sm: 96 }, overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', left: 8, top: 8, zIndex: 2, display: 'flex', gap: 0.5 }}>
                <Chip
                  label={`L${displayLevel}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: 'warning.light',
                    color: 'warning.contrastText',
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${p.iconColor}22 0%, rgba(0,0,0,0.04) 55%)`,
                }}
              >
                <Box sx={{ color: p.iconColor, opacity: 0.9 }}>
                  <ReportPinGlyph iconKey={p.pinIcon} className="size-10 sm:size-11" />
                </Box>
              </Box>
              <Chip
                label={REPORT_PIN_TAB_LABEL[p.pinType]}
                size="small"
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  zIndex: 2,
                  height: 18,
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                }}
              />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, p: 1 }}>
                <Typography variant="caption" fontWeight={600} color="common.white" noWrap>
                  {p.placemarkName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 10 }} noWrap>
                  {p.city}
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {p.placemarkName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Items —
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11 }}>
                Type: {REPORT_PIN_TAB_LABEL[p.pinType].toLowerCase()}
              </Typography>
              <Chip
                icon={<MapPinnedIcon sx={{ fontSize: '12px !important' }} />}
                label={p.category}
                size="small"
                variant="outlined"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: 10,
                  borderColor: 'primary.light',
                  color: 'primary.main',
                }}
              />
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderTop: 1,
                  borderColor: 'divider',
                  pt: 1,
                }}
              >
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
                  P
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Placemark
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
            <MapPinnedIcon sx={{ fontSize: 36, color: 'text.disabled', mx: 'auto' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This folder is empty
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {searchQuery.trim()
                ? 'No groups or placemarks match your search here.'
                : 'Open another folder from the path above or add groups and placemarks.'}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}
