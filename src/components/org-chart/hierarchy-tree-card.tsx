'use client'

import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { HierarchyFlowNodeRenderProps, OrgChartTreeNode } from '@/src/components/org-chart/hierarchy-flow-types'

function renderHighlighted(text: string, query: string) {
  const trimmed = query.trim()
  if (!trimmed) return text
  const idx = text.toLowerCase().indexOf(trimmed.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <Box
        component="mark"
        sx={{
          bgcolor: 'warning.light',
          color: 'warning.contrastText',
          px: 0.25,
          borderRadius: 0.5,
        }}
      >
        {text.slice(idx, idx + trimmed.length)}
      </Box>
      {text.slice(idx + trimmed.length)}
    </>
  )
}

export function HierarchyTreeCard<T extends OrgChartTreeNode>({
  node,
  highlight = '',
  selected = false,
  hasChildren = false,
  childCount = 0,
  expanded = false,
  onToggleExpand,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  allowEdit = false,
  allowDelete = false,
  allowCreate = false,
  isLeaf = true,
  childLabelSingular,
  childLabelPlural,
}: HierarchyFlowNodeRenderProps<T>) {
  const showActions =
    (allowCreate && onAddChild) || (allowEdit && onEdit) || (allowDelete && onDelete)
  const reserveBelow = showActions && isLeaf
  const actionReservePx = reserveBelow ? 36 : 0

  const subLabel = childCount === 1 ? childLabelSingular : childLabelPlural.replace('{count}', String(childCount))

  return (
    <Box
      className="hierarchy-card-wrap nodrag nopan nowheel"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: reserveBelow ? `${actionReservePx}px` : 0,
        pointerEvents: 'all',
        '&:hover .hierarchy-card-actions, &:focus-within .hierarchy-card-actions': {
          opacity: 1,
          pointerEvents: 'auto',
          transform: 'translate(-50%, 0) !important',
        },
      }}
    >
      <Box
        role="treeitem"
        aria-label={node.name}
        aria-selected={selected}
        aria-expanded={hasChildren ? expanded : undefined}
        className="hierarchy-card-face"
        onClick={() => onSelect?.()}
        sx={{
          minWidth: 168,
          maxWidth: 300,
          borderRadius: 2,
          border: '2px solid',
          borderColor: selected ? 'primary.main' : hasChildren && expanded ? 'info.main' : 'divider',
          bgcolor: selected ? 'action.selected' : 'background.paper',
          overflow: 'hidden',
          cursor: onSelect ? 'pointer' : 'default',
          boxShadow: (theme) =>
            selected
              ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}`
              : hasChildren && expanded
                ? `0 4px 16px ${alpha(theme.palette.info.main, 0.15)}`
                : `0 2px 10px ${alpha(theme.palette.common.black, 0.06)}`,
          transition: (theme) =>
            theme.transitions.create(['box-shadow', 'border-color', 'background-color'], {
              duration: 180,
            }),
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            align="center"
            sx={{ color: 'text.primary', lineHeight: 1.4, wordBreak: 'break-word' }}
          >
            {renderHighlighted(node.name, highlight)}
          </Typography>
        </Box>

        {hasChildren && onToggleExpand ? (
          <Box
            component="button"
            type="button"
            className="nodrag nopan"
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpand()
            }}
            onPointerDown={(event) => event.stopPropagation()}
            aria-expanded={expanded}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              py: 0.875,
              px: 1.5,
              border: 'none',
              borderTop: '1px solid',
              borderColor: expanded ? 'info.main' : 'divider',
              bgcolor: (theme) =>
                expanded
                  ? alpha(theme.palette.info.main, 0.12)
                  : theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.04)
                    : theme.palette.grey[50],
              cursor: 'pointer',
              transition: 'background-color 160ms ease',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.18),
              },
            }}
          >
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {subLabel}
            </Typography>
            {expanded ? (
              <ExpandLessIcon sx={{ fontSize: 18, color: 'info.main' }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 18, color: 'info.main' }} />
            )}
          </Box>
        ) : null}
      </Box>

      {showActions ? (
        <Stack
          className="hierarchy-card-actions nodrag nopan"
          direction="row"
          spacing={0.25}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            left: '50%',
            ...(isLeaf
              ? { bottom: 0, transform: 'translate(-50%, 4px)' }
              : { bottom: '100%', mb: 0.5, transform: 'translate(-50%, -4px)' }),
            zIndex: 4,
            px: 0.5,
            py: 0.25,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.common.black, 0.12)}`,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 180ms ease, transform 180ms ease',
          }}
        >
          {allowCreate && onAddChild ? (
            <Tooltip title="Add child" arrow>
              <IconButton
                size="small"
                aria-label="Add child"
                onClick={(event) => {
                  event.stopPropagation()
                  onAddChild()
                }}
                sx={{ color: 'info.main' }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ) : null}
          {allowEdit && onEdit ? (
            <Tooltip title="Edit" arrow>
              <IconButton
                size="small"
                aria-label="Edit"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit()
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ) : null}
          {allowDelete && onDelete ? (
            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                aria-label="Delete"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete()
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ) : null}
    </Box>
  )
}
