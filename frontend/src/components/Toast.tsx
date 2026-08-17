"use client"

import { toast } from "sonner"

// Toast utility functions - import and call these directly
export const showToast = {
  default: (message: string) => toast(message),
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string
    }
  ) => toast.promise(promise, options),
}

// Demo component to test toasts (optional)
export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition"
        onClick={() => showToast.default("Event has been created")}
      >
        Default
      </button>
      <button
        className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition"
        onClick={() => showToast.success("Event has been created")}
      >
        Success
      </button>
      <button
        className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition"
        onClick={() => showToast.info("Be at the area 10 minutes before the event time")}
      >
        Info
      </button>
      <button
        className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition"
        onClick={() => showToast.warning("Event start time cannot be earlier than 8am")}
      >
        Warning
      </button>
      <button
        className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition"
        onClick={() => showToast.error("Event has not been created")}
      >
        Error
      </button>
      <button
        className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition"
        onClick={() => {
          showToast.promise(
            new Promise<{ name: string }>((resolve) =>
              setTimeout(() => resolve({ name: "Event" }), 2000)
            ),
            {
              loading: "Loading...",
              success: (data) => `${data.name} has been created`,
              error: "Error",
            }
          )
        }}
      >
        Promise
      </button>
    </div>
  )
}

export default showToast