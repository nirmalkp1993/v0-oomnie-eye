"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Building2 } from "lucide-react";
import type { OrgChartTreeNode } from "@/src/components/org-chart/hierarchy-flow-types";
import { HierarchyFormChildrenSection } from "@/src/components/user-management/hierarchy-form-children-section";
import { HierarchyManageTreePanel } from "@/src/components/user-management/hierarchy-manage-tree-panel";
import { useDepartmentStore } from "@/lib/department-store";
import { useUserDirectoryStore } from "@/lib/user-directory-store";
import { DialogFormField } from "@/src/components/modals/app-dialog";
import {
  findUsersAssignedToDepartmentPaths,
  formatDepartmentDeleteBlockedMessage,
} from "@/src/lib/department-assignment.utils";
import { findDepartmentNode } from "@/src/lib/department-tree.utils";
import {
  collectNestedPathOptions,
  type HierarchyTreeNode,
} from "@/src/lib/nested-tree-path-options";
import { useAdminSnackbar } from "@/src/hooks/use-admin-snackbar";

const MANAGE_MODAL_WIDTH_PX = 980;
const FORM_DIALOG_WIDTH_PX = 520;

const responsiveModalWidthSx = (widthPx: number) =>
  ({
    width: { xs: "calc(100vw - 32px)", sm: widthPx },
    maxWidth: "calc(100vw - 32px)",
  }) as const;

type DepartmentFormMode =
  | { type: "add-root" }
  | { type: "add-child"; parentId: string }
  | { type: "edit"; nodeId: string };

function getDepartmentPathLabel(tree: HierarchyTreeNode[], id: string): string {
  const option = collectNestedPathOptions(tree).find((item) => item.id === id);
  if (option) return option.label;
  return findDepartmentNode(tree, id)?.name ?? "";
}

const outlineFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
} as const;

function DepartmentFormDialog({
  open,
  mode,
  tree,
  onClose,
  onSaved,
  onTreeChanged,
}: {
  open: boolean;
  mode: DepartmentFormMode | null;
  tree: HierarchyTreeNode[];
  onClose: () => void;
  onSaved: (nodeId: string) => void;
  onTreeChanged?: () => void;
}) {
  const theme = useTheme();
  const { showMessage } = useAdminSnackbar();
  const createRoot = useDepartmentStore((state) => state.createRoot);
  const createChild = useDepartmentStore((state) => state.createChild);
  const rename = useDepartmentStore((state) => state.rename);
  const reparent = useDepartmentStore((state) => state.reparent);

  const [nameInput, setNameInput] = useState("");
  const [selectedAttachId, setSelectedAttachId] = useState("");

  const isEdit = mode?.type === "edit";
  const parentId = mode?.type === "add-child" ? mode.parentId : null;
  const editNodeId = mode?.type === "edit" ? mode.nodeId : null;

  const parentPathLabel = parentId
    ? getDepartmentPathLabel(tree, parentId)
    : "";
  const editPathLabel = editNodeId
    ? getDepartmentPathLabel(tree, editNodeId)
    : "";
  const editNode = editNodeId ? findDepartmentNode(tree, editNodeId) : null;
  const childrenParentId =
    mode?.type === "edit"
      ? mode.nodeId
      : mode?.type === "add-child"
        ? mode.parentId
        : null;
  const showChildrenSection =
    mode?.type === "edit" ||
    mode?.type === "add-child" ||
    mode?.type === "add-root";
  const isNewRootChildren = mode?.type === "add-root";

  useEffect(() => {
    if (!open || !mode) {
      setNameInput("");
      setSelectedAttachId("");
      return;
    }
    if (mode.type === "edit") {
      const node = findDepartmentNode(tree, mode.nodeId);
      setNameInput(node?.name ?? "");
      setSelectedAttachId("");
      return;
    }
    setNameInput("");
    setSelectedAttachId("");
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
      ? "Add root department"
      : mode.type === "add-child"
        ? "Add child department"
        : "Edit department";

  const trimmedName = nameInput.trim();
  const hasNameChange = Boolean(
    isEdit && trimmedName && trimmedName !== editNode?.name,
  );
  const hasAttachSelection = Boolean(selectedAttachId);

  const canSave =
    mode.type === "add-root"
      ? Boolean(trimmedName)
      : mode.type === "add-child"
        ? Boolean(trimmedName || hasAttachSelection)
        : Boolean(hasNameChange || hasAttachSelection);

  const handleSave = () => {
    if (mode.type === "add-root") {
      if (!trimmedName) {
        showMessage("Enter a department name", "warning");
        return;
      }

      const id = createRoot(trimmedName);
      if (!id) {
        showMessage(
          "Could not add department — name may already exist",
          "warning",
        );
        return;
      }

      if (selectedAttachId) {
        const ok = reparent(selectedAttachId, id);
        if (!ok) {
          showMessage(
            "Root created but could not attach child department",
            "warning",
          );
          onTreeChanged?.();
          onSaved(id);
          return;
        }
      }

      showMessage(
        selectedAttachId
          ? "Root department added with child attached"
          : "Department added",
        "success",
      );
      onTreeChanged?.();
      onSaved(id);
      return;
    }

    if (mode.type === "add-child") {
      if (!trimmedName && !selectedAttachId) {
        showMessage("Enter a name or select a department to attach", "warning");
        return;
      }

      let savedId = mode.parentId;
      if (trimmedName) {
        const id = createChild(mode.parentId, trimmedName);
        if (!id) {
          showMessage("Could not add child department", "warning");
          return;
        }
        savedId = id;
      }

      if (selectedAttachId) {
        const ok = reparent(selectedAttachId, mode.parentId);
        if (!ok) {
          showMessage("Could not attach department", "warning");
          return;
        }
      }

      showMessage(
        trimmedName && selectedAttachId
          ? "Department added and attached"
          : selectedAttachId
            ? "Department attached"
            : "Child department added",
        "success",
      );
      onTreeChanged?.();
      onSaved(savedId);
      return;
    }

    if (!hasNameChange && !selectedAttachId) return;

    if (hasNameChange) {
      const ok = rename(mode.nodeId, trimmedName);
      if (!ok) {
        showMessage("Could not save — name may already exist", "warning");
        return;
      }
    }

    if (selectedAttachId) {
      const ok = reparent(selectedAttachId, mode.nodeId);
      if (!ok) {
        showMessage("Could not attach department", "warning");
        return;
      }
    }

    showMessage(
      hasNameChange && selectedAttachId
        ? "Department updated and attached"
        : selectedAttachId
          ? "Department attached"
          : "Department updated",
      "success",
    );
    onTreeChanged?.();
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

      <Box sx={{ px: 2.5, py: 2, overflowY: "auto", flex: 1, minHeight: 0 }}>
        <DialogFormField
          label="Department name"
          htmlFor="departmentFormName"
          required={mode.type === "add-root" || mode.type === "edit"}
        >
          <TextField
            id="departmentFormName"
            fullWidth
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter department name"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) handleSave();
            }}
            sx={outlineFieldSx}
          />
        </DialogFormField>

        {showChildrenSection ? (
          <HierarchyFormChildrenSection
            tree={tree}
            parentId={childrenParentId}
            entityLabel="department"
            selectedAttachId={selectedAttachId}
            onSelectedAttachIdChange={setSelectedAttachId}
            dropdownZIndex={theme.zIndex.modal + 6}
            isNewRoot={isNewRootChildren}
          />
        ) : null}
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
          {isEdit ? "Save changes" : "Add department"}
        </Button>
      </Box>
    </Dialog>
  );
}

export interface DepartmentManageOverlayProps {
  onClose: () => void;
  onTreeChanged?: () => void;
}

/** In-dialog overlay panel for department CRUD (no separate MUI Dialog). */
export function DepartmentManageOverlay({
  onClose,
  onTreeChanged,
}: DepartmentManageOverlayProps) {
  const { showMessage } = useAdminSnackbar();
  const tree = useDepartmentStore((state) => state.tree);
  const remove = useDepartmentStore((state) => state.remove);
  const getSubtreePathLabels = useDepartmentStore((state) => state.getSubtreePathLabels);
  const directoryUsers = useUserDirectoryStore((state) => state.users);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<DepartmentFormMode | null>(null);

  const selectedPathLabel = selectedId
    ? getDepartmentPathLabel(tree, selectedId)
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

  const getAssignedUsersForNode = (nodeId: string) => {
    const pathLabels = getSubtreePathLabels(nodeId);
    return findUsersAssignedToDepartmentPaths(directoryUsers, pathLabels);
  };

  const requestDeleteForNode = (nodeId: string) => {
    const assignedUsers = getAssignedUsersForNode(nodeId);
    if (assignedUsers.length > 0) {
      showMessage(formatDepartmentDeleteBlockedMessage(assignedUsers), "warning");
      return;
    }
    setSelectedId(nodeId);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const assignedUsers = getAssignedUsersForNode(selectedId);
    if (assignedUsers.length > 0) {
      showMessage(formatDepartmentDeleteBlockedMessage(assignedUsers), "warning");
      setConfirmDeleteOpen(false);
      return;
    }
    remove(selectedId);
    showMessage("Department deleted", "success");
    setSelectedId(null);
    setConfirmDeleteOpen(false);
    notifyTreeChanged();
  };

  const handleSelectNode = (node: OrgChartTreeNode) => setSelectedId(node.id);

  const handleEditNode = (node: OrgChartTreeNode) => {
    setSelectedId(node.id);
    setFormMode({ type: "edit", nodeId: node.id });
  };

  const handleAddChildNode = (node: OrgChartTreeNode) => {
    setSelectedId(node.id);
    setFormMode({ type: "add-child", parentId: node.id });
  };

  return (
    <>
      <Paper
        elevation={12}
        onClick={(e) => e.stopPropagation()}
        sx={{
          ...responsiveModalWidthSx(MANAGE_MODAL_WIDTH_PX),
          maxHeight: "min(760px, 90vh)",
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
            <Building2 className="size-5 text-primary-foreground" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{ color: "warning.main", fontWeight: 600 }}
            >
              Manage departments
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add, edit, or remove departments in the hierarchy
            </Typography>
          </Box>
          <IconButton
            aria-label="Close manage departments"
            onClick={onClose}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            px: 2.5,
            py: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {confirmDeleteOpen ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Delete department?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This removes <strong>{selectedPathLabel}</strong> and all nested
                departments.
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
            <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
              <HierarchyManageTreePanel
                nodes={tree}
                entityLabel="departments"
                childLabelSingular="1 sub-department"
                childLabelPlural="{count} sub-departments"
                selectedId={selectedId}
                onSelect={handleSelectNode}
                onEdit={handleEditNode}
                onDelete={(node) => requestDeleteForNode(node.id)}
                onAddChild={handleAddChildNode}
                emptyMessage='No departments yet. Use "Add root" to create one.'
              />

              {selectedId ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: 1,
                    borderColor: "divider",
                    flexShrink: 0,
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

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setFormMode({ type: "add-root" })}
                  sx={{ textTransform: "none" }}
                >
                  Add root
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

      <DepartmentFormDialog
        open={formMode != null}
        mode={formMode}
        tree={tree}
        onClose={closeForm}
        onSaved={handleFormSaved}
        onTreeChanged={notifyTreeChanged}
      />
    </>
  );
}

export function DepartmentManageModal({
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
      <DepartmentManageOverlay
        onClose={onClose}
        onTreeChanged={onTreeChanged}
      />
    </Dialog>
  );
}
