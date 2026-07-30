/**
 * User Card component for displaying user in a card format (mobile view).
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays user info in a card layout
 *   - ✅ Uses design.md card patterns (rounded-card, shadow-card)
 *   - ✅ Accessibility (aria-label, semantic HTML)
 *   - ❌ No business logic
 */

import type { User } from "../types/user-management.types";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import UserStatusDialog from "./UserStatusDialog";
import { useState } from "react";

interface UserCardProps {
  /** User data to display. */
  user: User;
  /** Callback when user status change is requested. */
  onStatusChange: (user: User) => void;
  /** Whether a status change is in progress. */
  isStatusChanging: boolean;
}

export default function UserCard({
  user,
  onStatusChange,
  isStatusChanging,
}: UserCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatusClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    onStatusChange(user);
    handleDialogClose();
  };

  /** Format date to Vietnamese locale. */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /** Get user initials for avatar. */
  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <>
      <article
        className="rounded-card bg-white p-4 shadow-card border border-ink/10 hover:shadow-raised transition-shadow"
        aria-label={`Thông tin người dùng: ${user.fullName}`}
      >
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-full bg-ink/10 flex items-center justify-center flex-shrink-0"
            aria-label={user.avatar.alt || `Avatar của ${user.fullName}`}
          >
            {user.avatar.url ? (
              <img
                src={user.avatar.url}
                alt={user.avatar.alt || user.fullName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="font-display font-medium text-ink">
                {getInitials(user.fullName)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-body font-medium text-ink truncate">
                  {user.fullName}
                </h3>
                <p className="font-body text-sm text-ink/60 truncate">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge status={user.status} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 font-body text-ink/60">
                <span className="font-mono">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStatusClick}
            disabled={isStatusChanging}
            aria-label={
              user.status === "ACTIVE"
                ? `Vô hiệu hóa ${user.fullName}`
                : `Kích hoạt ${user.fullName}`
            }
            className="flex-shrink-0 rounded-seal px-3 py-1.5 font-body text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {user.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
          </button>
        </div>
      </article>

      {/* Status Change Dialog */}
      <UserStatusDialog
        isOpen={isDialogOpen}
        userName={user.fullName}
        userEmail={user.email}
        currentStatus={user.status}
        onConfirm={handleDialogConfirm}
        onClose={handleDialogClose}
        isPending={isStatusChanging}
      />
    </>
  );
}
