export const selectionCardSx = (selected: boolean) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.5,
  p: 1.5,
  borderRadius: 2,
  border: '1px solid',
  borderColor: selected ? 'primary.main' : 'divider',
  bgcolor: selected ? 'action.selected' : 'background.paper',
  cursor: 'pointer',
  transition: 'border-color 0.15s, background-color 0.15s',
  '&:hover': {
    borderColor: selected ? 'primary.main' : 'text.disabled',
    bgcolor: selected ? 'action.selected' : 'action.hover',
  },
})

export const auditCardSx = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
  p: 1.5,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}
