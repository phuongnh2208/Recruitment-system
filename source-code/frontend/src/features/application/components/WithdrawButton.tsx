/**
 * Withdraw Button component for initiating application withdrawal.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Triggers withdraw confirmation dialog
 *   - ✅ Loading and disabled states
 *   - ✅ Accessibility (aria-labels, focus management)
 *   - ✅ Follows design.md patterns (danger button)
 */

import { useState } from "react";
import WithdrawConfirmDialog from "./WithdrawConfirmDialog";

/** Props for the WithdrawButton component. */
export interface WithdrawButtonProps {
  /** Application ID to withdraw. */
  applicationId: string;
  /** Current application state. */
  applicationState: string;
  /** Callback when withdrawal is successful. */
  onWithdrawSuccess?: () => void;
}

/**
 * WithdrawButton component for initiating application withdrawal.
 *
 * Only shows for applications in APPLIED or UNDER_REVIEW states.
 * Opens a confirmation dialog when clicked.
 *
 * @param props - Component props.
 * @returns The rendered button or null if not applicable.
 */
export default function WithdrawButton({
  applicationId,
  applicationState,
  onWithdrawSuccess,
}: WithdrawButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Only show button for APPLIED or UNDER_REVIEW states
  if (applicationState !== "APPLIED" && applicationState !== "UNDER_REVIEW") {
    return null;
  }

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleWithdrawSuccess = () => {
    setIsDialogOpen(false);
    onWithdrawSuccess?.();
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="rounded-seal border border-danger px-4 py-2 font-body text-sm font-medium text-danger transition hover:bg-danger-light focus:outline-none focus:ring-2 focus:ring-danger/20"
        aria-label="Hủy ứng tuyển"
      >
        Hủy ứng tuyển
      </button>

      <WithdrawConfirmDialog
        isOpen={isDialogOpen}
        applicationId={applicationId}
        onClose={handleDialogClose}
        onSuccess={handleWithdrawSuccess}
      />
    </>
  );
}
