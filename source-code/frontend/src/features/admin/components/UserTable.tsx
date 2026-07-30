/**
 * User Table component for displaying users in a table format.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays users in a responsive table
 *   - ✅ Uses design.md table patterns
 *   - ✅ Accessibility (aria-label, semantic HTML)
 *   - ❌ No business logic
 */

import { useState } from "react";
import type { User } from "../types/user-management.types";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import UserStatusDialog from "./UserStatusDialog";

interface UserTableProps {
  /** List of users to display. */
  users: User[];
  /** Callback when user status change is requested. */
  onStatusChange: (user: User) => void;
  /** Whether a status change is in progress. */
  isStatusChanging: boolean;
}

export default function UserTable({
  users,
  onStatusChange,
  isStatusChanging,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatusClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDialogConfirm = () => {
    if (selectedUser) {
      onStatusChange(selectedUser);
    }
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
      <div className="overflow-x-auto">
        <table
          className="w-full"
          role="table"
          aria-label="Danh sách người dùng"
        >
          <thead>
            <tr className="border-b border-ink/10">
              <th className="text-left px-4 py-3 font-body text-xs font-medium text-ink/50 uppercase tracking-wider">
                Avatar
              </th>
              <th className="text-left px-4 py-3 font-body text-xs font-medium text-ink/50 uppercase tracking-wider">
                Thông tin
              </th>
              <th className="text-left px-4 py-3 font-body text-xs font-medium text-ink/50 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="text-left px-4 py-3 font-body text-xs font-medium text-ink/50 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 font-body text-xs font-medium text-ink/50 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="text-left px-4 py-3 font-body text-xs font-medium text-ink/50 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-sage/20 transition-colors">
                <td className="px-4 py-4">
                  <div
                    className="h-10 w-10 rounded-full bg-ink/10 flex items-center justify-center flex-shrink-0"
                    aria-label={
                      user.avatar.alt || `Avatar của ${user.fullName}`
                    }
                  >
                    {user.avatar.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.avatar.alt || user.fullName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-display font-medium text-ink text-sm">
                        {getInitials(user.fullName)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-body font-medium text-ink">
                    {user.fullName}
                  </p>
                  <p className="font-body text-sm text-ink/60 truncate max-w-xs">
                    {user.email}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-4 py-4">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="px-4 py-4 font-body text-sm text-ink/60 font-mono">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => handleStatusClick(user)}
                    disabled={isStatusChanging}
                    aria-label={
                      user.status === "ACTIVE"
                        ? `Vô hiệu hóa ${user.fullName}`
                        : `Kích hoạt ${user.fullName}`
                    }
                    className="rounded-seal px-3 py-1.5 font-body text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {user.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Change Dialog */}
      <UserStatusDialog
        isOpen={isDialogOpen}
        userName={selectedUser?.fullName ?? ""}
        userEmail={selectedUser?.email ?? ""}
        currentStatus={selectedUser?.status ?? "ACTIVE"}
        onConfirm={handleDialogConfirm}
        onClose={handleDialogClose}
        isPending={isStatusChanging}
      />
    </>
  );
}
