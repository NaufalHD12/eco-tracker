import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { toast as sonnerToast } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Toast utilities for consistent messaging across the app
export const showToast = {
  success: (message) => {
    sonnerToast.success(message, {
      style: {
        background: '#10b981',
        color: 'white',
        border: 'none',
      },
    });
  },
  error: (message) => {
    sonnerToast.error(message, {
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
      },
    });
  },
  warning: (message) => {
    sonnerToast.warning(message, {
      style: {
        background: '#f59e0b',
        color: 'white',
        border: 'none',
      },
    });
  },
  info: (message) => {
    sonnerToast.info(message, {
      style: {
        background: '#3b82f6',
        color: 'white',
        border: 'none',
      },
    });
  },
};
