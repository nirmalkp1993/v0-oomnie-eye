"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MapPin } from "lucide-react";
import { useOfficeStore } from "@/lib/office-store";
import { useUserDirectoryStore } from "@/lib/user-directory-store";
import { DialogFormField } from "@/src/components/modals/app-dialog";
import {
  findUsersAssignedToOfficePaths,
  formatOfficeDeleteBlockedMessage,
} from "@/src/lib/office-assignment.utils";
import { findOfficeNode } from "@/src/lib/office-tree.utils";
import {
  isOfficeAddressComplete,
  isOfficeNameComplete,
  officeAddressesEqual,
} from "@/src/lib/office-address.utils";
import {
  collectNestedPathOptions,
  filterNestedPathOptions,
  type HierarchyTreeNode,
} from "@/src/lib/nested-tree-path-options";
import { useAdminSnackbar } from "@/src/hooks/use-admin-snackbar";
import {
  getOfficeCityOptionsForState,
  getOfficeCountryOptions,
  getOfficeStateOptionsForCountry,
} from "@/src/mock-data/office-location-options";
import {
  EMPTY_OFFICE_ADDRESS,
  EMPTY_OFFICE_NAME,
  type OfficeAddress,
  type OfficeTreeNode,
} from "@/src/types/office";

const ROW_HEIGHT = 40;
const INDENT_PX = 20;
const MANAGE_MODAL_WIDTH_PX = 980;
const FORM_DIALOG_WIDTH_PX = 560;

function getOfficeAddressFromNode(node: OfficeTreeNode | null): OfficeAddress {
  if (node?.address) {
    return { ...node.address };
  }
  return { ...EMPTY_OFFICE_ADDRESS };
}

function getOfficeNameFromNode(node: OfficeTreeNode | null): string {
  return node?.officeName ?? EMPTY_OFFICE_NAME;
}

const responsiveModalWidthSx = (widthPx: number) =>
  ({
    width: { xs: "calc(100vw - 32px)", sm: widthPx },
    maxWidth: "calc(100vw - 32px)",
  }) as const;

type OfficeFormMode =
  | { type: "add-root" }
  | { type: "add-child"; parentId: string }
  | { type: "edit"; nodeId: string };

function getOfficePathLabel(tree: HierarchyTreeNode[], id: string): string {
  const option = collectNestedPathOptions(tree).find((item) => item.id === id);
  if (option) return option.label;
  return findOfficeNode(tree, id)?.name ?? "";
}

function TreeConnector({ depth }: { depth: number }) {
  if (depth <= 0) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        width: 14,
        height: 14,
        flexShrink: 0,
        mr: 0.75,
        color: "text.disabled",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 4,
          top: 0,
          bottom: "50%",
          width: "1px",
          bgcolor: "currentColor",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: 4,
          top: "50%",
          width: 8,
          height: "1px",
          bgcolor: "currentColor",
        }}
      />
    </Box>
  );
}

function renderManageTree(
  nodes: HierarchyTreeNode[],
  depth: number,
  selectedId: string | null,
  onSelect: (id: string) => void,
): ReactNode[] {
  const rows: ReactNode[] = [];

  for (const node of nodes) {
    rows.push(
      <ListItemButton
        key={node.id}
        selected={selectedId === node.id}
        onClick={() => onSelect(node.id)}
        sx={{
          minHeight: ROW_HEIGHT,
          py: 0.5,
          pl: `${12 + depth * INDENT_PX}px`,
          pr: 1,
          "&.Mui-selected": {
            bgcolor: "action.selected",
            "&:hover": { bgcolor: "action.selected" },
          },
        }}
      >
        <TreeConnector depth={depth} />
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: depth === 0 ? 600 : 400 }}
        >
          {node.name}
        </Typography>
      </ListItemButton>,
    );
    if (node.children?.length) {
      rows.push(
        ...renderManageTree(node.children, depth + 1, selectedId, onSelect),
      );
    }
  }

  return rows;
}

const outlineFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
} as const;

function SearchableLocationField({
  label,
  htmlFor,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  htmlFor: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <DialogFormField label={label} htmlFor={htmlFor} required>
      <Autocomplete
        id={htmlFor}
        fullWidth
        options={options}
        value={value || null}
        disabled={disabled}
        openOnFocus
        onChange={(_, nextValue) => onChange(nextValue ?? "")}
        isOptionEqualToValue={(option, selected) => option === selected}
        noOptionsText="No matches"
        slotProps={{
          popper: {
            sx: { zIndex: theme.zIndex.modal + 10 },
          },
          listbox: {
            sx: { maxHeight: 240 },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder={placeholder}
            sx={outlineFieldSx}
          />
        )}
      />
    </DialogFormField>
  );
}

function OfficeFormDialog({
  open,
  mode,
  tree,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: OfficeFormMode | null;
  tree: HierarchyTreeNode[];
  onClose: () => void;
  onSaved: (nodeId: string) => void;
}) {
  const theme = useTheme();
  const { showMessage } = useAdminSnackbar();
  const createRoot = useOfficeStore((state) => state.createRoot);
  const createChild = useOfficeStore((state) => state.createChild);
  const updateOffice = useOfficeStore((state) => state.updateOffice);

  const [officeNameInput, setOfficeNameInput] = useState(EMPTY_OFFICE_NAME);
  const [addressInput, setAddressInput] = useState<OfficeAddress>({
    ...EMPTY_OFFICE_ADDRESS,
  });

  const isEdit = mode?.type === "edit";
  const parentId = mode?.type === "add-child" ? mode.parentId : null;
  const editNodeId = mode?.type === "edit" ? mode.nodeId : null;

  const parentPathLabel = parentId ? getOfficePathLabel(tree, parentId) : "";
  const editPathLabel = editNodeId ? getOfficePathLabel(tree, editNodeId) : "";
  const editNode = editNodeId
    ? (findOfficeNode(tree, editNodeId) as OfficeTreeNode | null)
    : null;
  const initialOfficeName = getOfficeNameFromNode(editNode);
  const initialAddress = getOfficeAddressFromNode(editNode);

  const setAddressField = <K extends keyof OfficeAddress>(
    field: K,
    value: string,
  ) => {
    setAddressInput((current) => {
      const next = { ...current, [field]: value };
      if (field === "country") {
        next.state = "";
        next.city = "";
      }
      if (field === "state") {
        next.city = "";
      }
      return next;
    });
  };

  const countryOptions = useMemo(
    () => getOfficeCountryOptions(addressInput.country),
    [addressInput.country],
  );
  const stateOptions = useMemo(
    () =>
      getOfficeStateOptionsForCountry(addressInput.country, addressInput.state),
    [addressInput.country, addressInput.state],
  );
  const cityOptions = useMemo(
    () => getOfficeCityOptionsForState(addressInput.state, addressInput.city),
    [addressInput.state, addressInput.city],
  );

  useEffect(() => {
    if (!open || !mode) {
      setOfficeNameInput(EMPTY_OFFICE_NAME);
      setAddressInput({ ...EMPTY_OFFICE_ADDRESS });
      return;
    }
    if (mode.type === "edit") {
      const node = findOfficeNode(tree, mode.nodeId) as OfficeTreeNode | null;
      setOfficeNameInput(getOfficeNameFromNode(node));
      setAddressInput(getOfficeAddressFromNode(node));
      return;
    }
    setOfficeNameInput(EMPTY_OFFICE_NAME);
    setAddressInput({ ...EMPTY_OFFICE_ADDRESS });
  }, [open, mode, tree]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  if (!open || !mode) return null;

  const title =
    mode.type === "add-root"
      ? "Add root office"
      : mode.type === "add-child"
        ? "Add child office"
        : "Edit office";

  const canSave = Boolean(
    isOfficeNameComplete(officeNameInput) &&
    isOfficeAddressComplete(addressInput) &&
    (!isEdit ||
      officeNameInput.trim() !== initialOfficeName.trim() ||
      !officeAddressesEqual(addressInput, initialAddress)),
  );

  const handleSave = () => {
    if (!isOfficeNameComplete(officeNameInput)) {
      showMessage("Enter a office name", "warning");
      return;
    }
    if (!isOfficeAddressComplete(addressInput)) {
      showMessage("Fill in all address fields", "warning");
      return;
    }

    if (mode.type === "add-root") {
      const id = createRoot(officeNameInput, addressInput);
      if (!id) {
        showMessage(
          "Could not add office — this address may already exist",
          "warning",
        );
        return;
      }
      showMessage("Office added", "success");
      onSaved(id);
      return;
    }

    if (mode.type === "add-child") {
      const id = createChild(mode.parentId, officeNameInput, addressInput);
      if (!id) {
        showMessage("Could not add child office", "warning");
        return;
      }
      showMessage("Child office added", "success");
      onSaved(id);
      return;
    }

    const ok = updateOffice(mode.nodeId, officeNameInput, addressInput);
    if (!ok) {
      showMessage("Could not save — this address may already exist", "warning");
      return;
    }
    showMessage("Office updated", "success");
    onSaved(mode.nodeId);
  };

  return (
    <Dialog
      open
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") onClose();
      }}
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { bgcolor: alpha(theme.palette.common.black, 0.45) } },
      }}
      PaperProps={{
        sx: {
          ...responsiveModalWidthSx(FORM_DIALOG_WIDTH_PX),
          m: 2,
          borderRadius: 2,
          overflow: "hidden",
          maxHeight: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
      sx={{ zIndex: (t) => t.zIndex.modal + 4 }}
    >
      <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{ color: "warning.main", fontWeight: 600 }}
        >
          {title}
        </Typography>
        {mode.type === "add-child" ? (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Adding as child of
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: "primary.main" }}
            >
              {parentPathLabel}
            </Typography>
          </Box>
        ) : null}
        {mode.type === "edit" ? (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Current location
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editPathLabel}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack spacing={2}>
          <DialogFormField
            label="Office name"
            htmlFor="officeFormOfficeName"
            required
          >
            <TextField
              id="officeFormOfficeName"
              fullWidth
              autoFocus
              value={officeNameInput}
              onChange={(e) => setOfficeNameInput(e.target.value)}
              placeholder="Enter office name"
              sx={outlineFieldSx}
            />
          </DialogFormField>

          <DialogFormField
            label="Address line"
            htmlFor="officeFormAddressLine"
            required
          >
            <TextField
              id="officeFormAddressLine"
              fullWidth
              value={addressInput.addressLine}
              onChange={(e) => setAddressField("addressLine", e.target.value)}
              placeholder="Building, street, area"
              sx={outlineFieldSx}
            />
          </DialogFormField>

          <SearchableLocationField
            label="Country"
            htmlFor="officeFormCountry"
            options={countryOptions}
            value={addressInput.country}
            onChange={(value) => setAddressField("country", value)}
            placeholder="Search country…"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <SearchableLocationField
              label="State"
              htmlFor="officeFormState"
              options={stateOptions}
              value={addressInput.state}
              onChange={(value) => setAddressField("state", value)}
              placeholder={
                addressInput.country ? "Search state…" : "Select country first"
              }
              disabled={!addressInput.country}
            />

            <SearchableLocationField
              label="City"
              htmlFor="officeFormCity"
              options={cityOptions}
              value={addressInput.city}
              onChange={(value) => setAddressField("city", value)}
              placeholder={
                addressInput.state ? "Search city…" : "Select state first"
              }
              disabled={!addressInput.state}
            />
          </Box>

          <DialogFormField
            label="Pincode"
            htmlFor="officeFormPincode"
            required
          >
            <TextField
              id="officeFormPincode"
              fullWidth
              value={addressInput.pincode}
              onChange={(e) => setAddressField("pincode", e.target.value)}
              placeholder="Pincode"
              inputProps={{ inputMode: "numeric" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave) handleSave();
              }}
              sx={outlineFieldSx}
            />
          </DialogFormField>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          px: 2.5,
          py: 1.5,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={!canSave}
          sx={{ textTransform: "none" }}
        >
          {isEdit ? "Save changes" : "Add office"}
        </Button>
      </Box>
    </Dialog>
  );
}

export interface OfficeManageOverlayProps {
  onClose: () => void;
  onTreeChanged?: () => void;
}

export function OfficeManageOverlay({
  onClose,
  onTreeChanged,
}: OfficeManageOverlayProps) {
  const { showMessage } = useAdminSnackbar();
  const tree = useOfficeStore((state) => state.tree);
  const remove = useOfficeStore((state) => state.remove);
  const getSubtreePathLabels = useOfficeStore(
    (state) => state.getSubtreePathLabels,
  );
  const directoryUsers = useUserDirectoryStore((state) => state.users);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<OfficeFormMode | null>(null);

  const allOptions = useMemo(() => collectNestedPathOptions(tree), [tree]);
  const isSearching = searchQuery.trim().length > 0;
  const filteredOptions = useMemo(
    () => filterNestedPathOptions(allOptions, searchQuery),
    [allOptions, searchQuery],
  );

  const selectedPathLabel = selectedId
    ? getOfficePathLabel(tree, selectedId)
    : "";

  const notifyTreeChanged = () => {
    onTreeChanged?.();
  };

  const closeForm = () => setFormMode(null);

  const handleFormSaved = (nodeId: string) => {
    setSelectedId(nodeId);
    closeForm();
    notifyTreeChanged();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (formMode) {
        closeForm();
        return;
      }
      if (confirmDeleteOpen) {
        setConfirmDeleteOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [confirmDeleteOpen, formMode, onClose]);

  const getAssignedUsersForSelection = () => {
    if (!selectedId) return [];
    const pathLabels = getSubtreePathLabels(selectedId);
    return findUsersAssignedToOfficePaths(directoryUsers, pathLabels);
  };

  const requestDelete = () => {
    if (!selectedId) return;
    const assignedUsers = getAssignedUsersForSelection();
    if (assignedUsers.length > 0) {
      showMessage(formatOfficeDeleteBlockedMessage(assignedUsers), "warning");
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const assignedUsers = getAssignedUsersForSelection();
    if (assignedUsers.length > 0) {
      showMessage(formatOfficeDeleteBlockedMessage(assignedUsers), "warning");
      setConfirmDeleteOpen(false);
      return;
    }
    remove(selectedId);
    showMessage("Office deleted", "success");
    setSelectedId(null);
    setConfirmDeleteOpen(false);
    notifyTreeChanged();
  };

  return (
    <>
      <Paper
        elevation={12}
        onClick={(e) => e.stopPropagation()}
        sx={{
          ...responsiveModalWidthSx(MANAGE_MODAL_WIDTH_PX),
          maxHeight: "min(860px, 92vh)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.main",
              flexShrink: 0,
            }}
          >
            <MapPin className="size-5 text-primary-foreground" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{ color: "warning.main", fontWeight: 600 }}
            >
              Manage offices
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add, edit, or remove offices in the hierarchy
            </Typography>
          </Box>
          <IconButton
            aria-label="Close manage offices"
            onClick={onClose}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2.5, py: 2 }}>
          {confirmDeleteOpen ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Delete office?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This removes <strong>{selectedPathLabel}</strong> and all nested
                offices.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => setConfirmDeleteOpen(false)}
                  sx={{ textTransform: "none" }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  sx={{ textTransform: "none" }}
                >
                  Delete
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search offices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={outlineFieldSx}
              />

              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  maxHeight: 280,
                  overflowY: "auto",
                  bgcolor: "background.paper",
                }}
              >
                <List dense disablePadding>
                  {!isSearching ? (
                    tree.length === 0 ? (
                      <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          No offices yet. Use &quot;Add root&quot; to create
                          one.
                        </Typography>
                      </Box>
                    ) : (
                      renderManageTree(tree, 0, selectedId, setSelectedId)
                    )
                  ) : filteredOptions.length === 0 ? (
                    <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No offices match your search.
                      </Typography>
                    </Box>
                  ) : (
                    filteredOptions.map((option) => (
                      <ListItemButton
                        key={option.id}
                        selected={selectedId === option.id}
                        onClick={() => setSelectedId(option.id)}
                        sx={{ minHeight: ROW_HEIGHT, py: 0.5, px: 1.5 }}
                      >
                        <Typography variant="body2" noWrap>
                          {option.label}
                        </Typography>
                      </ListItemButton>
                    ))
                  )}
                </List>
              </Box>

              {selectedId ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Selected
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {selectedPathLabel}
                  </Typography>
                </Box>
              ) : null}

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setFormMode({ type: "add-root" })}
                  sx={{ textTransform: "none" }}
                >
                  Add root
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SubdirectoryArrowRightIcon />}
                  onClick={() => {
                    if (!selectedId) {
                      showMessage("Select a parent office first", "warning");
                      return;
                    }
                    setFormMode({ type: "add-child", parentId: selectedId });
                  }}
                  disabled={!selectedId}
                  sx={{ textTransform: "none" }}
                >
                  Add child
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => {
                    if (!selectedId) return;
                    setFormMode({ type: "edit", nodeId: selectedId });
                  }}
                  disabled={!selectedId}
                  sx={{ textTransform: "none" }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={requestDelete}
                  disabled={!selectedId}
                  sx={{ textTransform: "none" }}
                >
                  Delete
                </Button>
              </Box>
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            px: 2.5,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </Box>
      </Paper>

      <OfficeFormDialog
        open={formMode != null}
        mode={formMode}
        tree={tree}
        onClose={closeForm}
        onSaved={handleFormSaved}
      />
    </>
  );
}

export function OfficeManageModal({
  open,
  onClose,
  onTreeChanged,
}: {
  open: boolean;
  onClose: () => void;
  onTreeChanged?: () => void;
}) {
  const theme = useTheme();

  if (!open) return null;

  return (
    <Dialog
      open
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") onClose();
      }}
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { bgcolor: alpha(theme.palette.common.black, 0.55) } },
      }}
      PaperProps={{
        sx: {
          ...responsiveModalWidthSx(MANAGE_MODAL_WIDTH_PX),
          bgcolor: "transparent",
          backgroundImage: "none",
          boxShadow: "none",
          overflow: "visible",
          m: 2,
        },
      }}
      sx={{ zIndex: (t) => t.zIndex.modal + 2 }}
    >
      <OfficeManageOverlay onClose={onClose} onTreeChanged={onTreeChanged} />
    </Dialog>
  );
}
