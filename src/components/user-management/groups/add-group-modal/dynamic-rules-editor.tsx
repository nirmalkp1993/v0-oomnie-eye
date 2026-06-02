'use client'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  RULE_FIELD_OPTIONS,
  RULE_MATCH_MODES,
  RULE_OPERATOR_OPTIONS,
} from '@/src/constants/add-group'
import { DEPARTMENT_OPTIONS } from '@/src/constants/add-user'
import type { CreateGroupFormValues, DynamicRule, RuleMatchMode } from '@/src/types/user-management'
import { countMatchedUsers } from '@/src/lib/user-management/add-group-form.utils'
import { outlineFieldSx } from './add-group-modal.styles'

export interface DynamicRulesEditorProps {
  form: CreateGroupFormValues
  disabled?: boolean
  onMatchModeChange: (mode: RuleMatchMode) => void
  onAddRule: () => void
  onUpdateRule: (id: string, patch: Partial<DynamicRule>) => void
  onRemoveRule: (id: string) => void
}

export function DynamicRulesEditor({
  form,
  disabled = false,
  onMatchModeChange,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
}: DynamicRulesEditorProps) {
  const matchCount = countMatchedUsers(form)

  return (
    <Box>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Match
        </Typography>
        <FormControl size="small" sx={[outlineFieldSx, { minWidth: 88 }]}>
          <Select
            value={form.ruleMatchMode}
            onChange={(e) => onMatchModeChange(e.target.value as RuleMatchMode)}
            disabled={disabled}
          >
            {RULE_MATCH_MODES.map((mode) => (
              <MenuItem key={mode} value={mode}>
                {mode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          of the following rules
        </Typography>
      </Stack>

      {form.rules.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No rules yet — add one below.
        </Typography>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {form.rules.map((rule) => (
            <Stack
              key={rule.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
            >
              <FormControl size="small" sx={[outlineFieldSx, { flex: 1 }]} disabled={disabled}>
                <Select
                  value={rule.field}
                  onChange={(e) => onUpdateRule(rule.id, { field: e.target.value, value: '' })}
                >
                  {RULE_FIELD_OPTIONS.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={[outlineFieldSx, { flex: 1 }]} disabled={disabled}>
                <Select
                  value={rule.operator}
                  onChange={(e) => onUpdateRule(rule.id, { operator: e.target.value })}
                >
                  {RULE_OPERATOR_OPTIONS.map((op) => (
                    <MenuItem key={op} value={op}>
                      {op}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {rule.field === 'Department' ? (
                <FormControl size="small" sx={[outlineFieldSx, { flex: 1.5 }]} disabled={disabled}>
                  <Select
                    displayEmpty
                    value={rule.value}
                    onChange={(e) => onUpdateRule(rule.id, { value: e.target.value })}
                    renderValue={(v) =>
                      v || (
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                          Select…
                        </Box>
                      )
                    }
                  >
                    <MenuItem value="" disabled>
                      Select…
                    </MenuItem>
                    {DEPARTMENT_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  size="small"
                  placeholder="Value"
                  value={rule.value}
                  onChange={(e) => onUpdateRule(rule.id, { value: e.target.value })}
                  disabled={disabled}
                  sx={{ flex: 1.5, ...outlineFieldSx }}
                />
              )}
              <IconButton
                size="small"
                aria-label="Remove rule"
                onClick={() => onRemoveRule(rule.id)}
                disabled={disabled}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      <Button
        variant="outlined"
        size="small"
        onClick={onAddRule}
        disabled={disabled}
        sx={{ textTransform: 'none', borderRadius: 2, mb: 2 }}
      >
        + Add rule
      </Button>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <GroupOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {matchCount} users match this rule set
        </Typography>
      </Box>
    </Box>
  )
}
