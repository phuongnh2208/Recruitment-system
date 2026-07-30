import { useContext } from "react";
import { ToastContext } from "./ToastContextType";

/**
 * Hook to access the toast context.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
