'use client'

import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SecurityIcon from '@mui/icons-material/Security'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { USER_MANAGEMENT_ROUTES, type UserManagementHref } from '@/src/constants/navigation'

const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 76

const childLinks: { href: UserManagementHref; label: string; icon: typeof PersonOutlineIcon }[] = [
  { href: USER_MANAGEMENT_ROUTES.users, label: 'Users', icon: PersonOutlineIcon },
  { href: USER_MANAGEMENT_ROUTES.groups, label: 'Groups', icon: GroupOutlinedIcon },
  { href: USER_MANAGEMENT_ROUTES.roles, label: 'Roles & Permissions', icon: VerifiedUserOutlinedIcon },
  { href: USER_MANAGEMENT_ROUTES.roleAssignment, label: 'Role Assignment', icon: AssignmentIndOutlinedIcon },
]

interface AdminSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function AdminSidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
}: AdminSidebarProps) {
  const theme = useTheme()
  const pathname = usePathname()
  const [userMgmtOpen, setUserMgmtOpen] = useState(true)

  const isUnderUserManagement = useMemo(
    () => pathname?.startsWith('/user-management') ?? false,
    [pathname]
  )

  useEffect(() => {
    if (isUnderUserManagement) setUserMgmtOpen(true)
  }, [isUnderUserManagement])

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1 }}>
      <Box sx={{ px: collapsed ? 1 : 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          OE
        </Box>
        {!collapsed ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              OomniEye
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Enterprise Admin
            </Typography>
          </Box>
        ) : null}
      </Box>
      <Divider sx={{ opacity: 0.6 }} />
      <List sx={{ flex: 1, px: 0.5, pt: 1 }}>
        <ListItemButton
          onClick={() => {
            if (collapsed) onToggleCollapsed()
            setUserMgmtOpen((o) => !o)
          }}
          selected={isUnderUserManagement}
          sx={{
            mx: 1,
            borderRadius: 2,
            minHeight: 48,
            '&.Mui-selected': { border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}` },
          }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
            <SecurityIcon color={isUnderUserManagement ? 'primary' : 'inherit'} />
          </ListItemIcon>
          {!collapsed ? (
            <>
              <ListItemText primary="User Management" primaryTypographyProps={{ fontWeight: 600 }} />
              {userMgmtOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </>
          ) : null}
        </ListItemButton>
        <Collapse in={!collapsed && userMgmtOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 1.5 }}>
            {childLinks.map(({ href, label, icon: Icon }) => {
              const selected = pathname === href || pathname?.startsWith(`${href}/`)
              return (
                <ListItemButton
                  key={href}
                  component={Link}
                  href={href}
                  selected={Boolean(selected)}
                  onClick={onMobileClose}
                  sx={{
                    pl: 3,
                    borderRadius: 2,
                    my: 0.25,
                    borderLeft: selected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon fontSize="small" color={selected ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: selected ? 600 : 500 }}
                  />
                </ListItemButton>
              )
            })}
          </List>
        </Collapse>
      </List>
      <Box sx={{ px: 1, pb: 2 }}>
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton
            onClick={onToggleCollapsed}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              width: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 1)}`,
            }}
            color="inherit"
          >
            {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon sx={{ rotate: '90deg' }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH }, flexShrink: 0 }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            position: 'relative',
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}

export const ADMIN_DRAWER_WIDTH_EXPANDED = DRAWER_WIDTH
export const ADMIN_DRAWER_WIDTH_COLLAPSED = DRAWER_WIDTH_COLLAPSED
