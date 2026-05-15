'use client'

import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { usePathname } from 'next/navigation'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AdminHeader } from '@/src/components/layout/admin-header'
import { AdminSidebar } from '@/src/components/layout/admin-sidebar'

function titleFromPath(pathname: string | null): { title: string; subtitle: string } {
  if (!pathname) return { title: 'User Management', subtitle: 'Administration' }
  if (pathname.includes('/users')) return { title: 'Users', subtitle: 'Directory, access, and lifecycle' }
  if (pathname.includes('/groups')) return { title: 'Groups', subtitle: 'Organize teams and membership' }
  if (pathname.includes('/roles')) return { title: 'Roles & Permissions', subtitle: 'RBAC policies and matrices' }
  if (pathname.includes('/role-assignment'))
    return { title: 'Role Assignment', subtitle: 'Bulk assign roles across users and groups' }
  return { title: 'User Management', subtitle: 'Enterprise access control' }
}

export function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const onMobileClose = useCallback(() => setMobileOpen(false), [])

  const { title, subtitle } = useMemo(() => titleFromPath(pathname), [pathname])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={onMobileClose}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          transition: theme.transitions.create(['flex-basis'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
          }),
        }}
      >
        <AdminHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1680, mx: 'auto', width: '100%' }}>{children}</Box>
      </Box>
    </Box>
  )
}
