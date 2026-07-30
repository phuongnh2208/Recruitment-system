type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];

/**
 * Show a toast notification globally.
 * Call this from anywhere in the app: `showToast({ type: "success", message: "Done!" })`
 */
export function showToast(toast: Omit<ToastMessage, "id">) {
  const id = crypto.randomUUID();
  toastListeners.forEach((listener) => listener({ ...toast, id }));
}

/**
 * Register a listener for toast notifications.
 * Used internally by ToastProvider.
 */
export function registerToastListener(listener: (toast: ToastMessage) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}
