"use client";

import { type ReactNode, useEffect } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "../UI/Button";

/* ── Size map ───────────────────────────────────────────────────────────── */
const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export type ModalSize = keyof typeof SIZE_MAP;

/* ── Modal ──────────────────────────────────────────────────────────────── */
export interface ModalProps {
  open:         boolean;
  onClose:      () => void;
  title:        string;
  description?: string;
  size?:        ModalSize;
  footer?:      ReactNode;
  children:     ReactNode;
  hideClose?:   boolean;
}

export function Modal({
  open, onClose, title, description, size = "md",
  footer, children, hideClose = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full ${SIZE_MAP[size]} rounded-2xl bg-white shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-slate-400">{description}</p>
            )}
          </div>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ConfirmationDialog ─────────────────────────────────────────────────── */
export interface ConfirmationDialogProps {
  open:          boolean;
  onClose:       () => void;
  onConfirm:     () => void;
  title:         string;
  description?:  string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:      "danger" | "warning" | "primary";
  loading?:      boolean;
}

export function ConfirmationDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "danger", loading = false,
}: ConfirmationDialogProps) {
  const iconBg = variant === "danger"  ? "bg-red-100"
               : variant === "warning" ? "bg-amber-100"
               : "bg-indigo-100";
  const iconColor = variant === "danger"  ? "text-red-600"
                  : variant === "warning" ? "text-amber-600"
                  : "text-indigo-600";
  const Icon = variant === "danger" ? Trash2 : AlertTriangle;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="sm"
      hideClose
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "primary" ? "primary" : "danger"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">{title}</p>
          {description && (
            <p className="mt-1.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ── DeleteDialog ───────────────────────────────────────────────────────── */
export interface DeleteDialogProps {
  open:      boolean;
  onClose:   () => void;
  onConfirm: () => void;
  itemName:  string;
  loading?:  boolean;
}

export function DeleteDialog({ open, onClose, onConfirm, itemName, loading }: DeleteDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      variant="danger"
      title={`Delete ${itemName}?`}
      description={`This action is permanent and cannot be undone. All data associated with "${itemName}" will be removed.`}
      confirmLabel="Delete permanently"
    />
  );
}
