/**
 * User Status Change Confirmation Dialog.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Confirmation dialog for enabling/disabling user
 *   - ✅ Uses design.md dialog patterns
 *   - ✅ Accessibility (aria-modal, focus trap, ESC to close)
 *   - ✅ Keyboard navigation
 *   - ❌ No business logic - delegates to parent
 */

import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { UserStatus } from "../types/user-management.types";
import { STATUS_BADGE_CONFIG } from "../types/user-management.types";

interface UserStatusDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** User full name for display. */
  userName: string;
  /** User email for display. */
  userEmail: string;
  /** Current user status. */
  currentStatus: UserStatus;
  /** Callback when user confirms the action. */
  onConfirm: () => void;
  /** Callback when dialog is closed (cancel or backdrop click). */
  onClose: () => void;
  /** Whether the action is in progress. */
  isPending: boolean;
}

export default function UserStatusDialog({
  isOpen,
  userName,
  userEmail,
  currentStatus,
  onConfirm,
  onClose,
  isPending,
}: UserStatusDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
  const newConfig = STATUS_BADGE_CONFIG[newStatus];

  // Handle focus trap and ESC key
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      dialogRef.current?.showModal();
      // Focus the cancel button initially
      setTimeout(() => {
        const cancelButton =
          dialogRef.current?.querySelector<HTMLButtonElement>(
            '[data-testid="cancel-button"]',
          );
        cancelButton?.focus();
      }, 0);
    } else {
      dialogRef.current?.close();
      previousActiveElement.current?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="rounded-card bg-white p-6 shadow-raised border border-ink/10 max-w-md w-full mx-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2
            id="dialog-title"
            className="font-display text-lg font-semibold text-ink"
          >
            {currentStatus === "ACTIVE"
              ? "Vô hiệu hóa tài khoản"
              : "Kích hoạt tài khoản"}
          </h2>
          <p
            id="dialog-description"
            className="mt-1 font-body text-sm text-ink/60"
          >
            {currentStatus === "ACTIVE"
              ? "Người dùng sẽ không thể đăng nhập vào hệ thống."
              : "Người dùng sẽ có thể đăng nhập trở lại hệ thống."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="shrink-0 rounded-lg p-1 text-ink/40 hover:text-ink/70 hover:bg-sage/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Đóng hộp thoại"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-sage/30">
        <div className="h-10 w-10 rounded-full bg-ink/10 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-medium text-ink">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-medium text-ink truncate">{userName}</p>
          <p className="font-body text-sm text-ink/60 truncate">{userEmail}</p>
        </div>
        <UserStatusBadge status={currentStatus} />
      </div>

      <div className="mt-6">
        <p className="font-body text-sm text-ink/70">
          Trạng thái mới:
          <span className="ml-2">
            <UserStatusBadge status={newStatus} />
          </span>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          data-testid="cancel-button"
          className="rounded-seal border border-ink/15 px-4 py-2 font-body text-sm text-ink/70 transition hover:bg-sage/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={`rounded-seal px-4 py-2 font-body text-sm font-medium text-white transition ${
            newConfig.actionVariant === "danger"
              ? "bg-danger hover:bg-danger/90"
              : "bg-primary hover:bg-primary-dark"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang xử lý...
            </span>
          ) : (
            newConfig.actionLabel
          )}
        </button>
      </div>
    </dialog>
  );
}

// Re-export the badge component for use in this file
import UserStatusBadge from "./UserStatusBadge";
