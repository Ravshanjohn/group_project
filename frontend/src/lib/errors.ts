import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export function getErrorMessage(error: unknown, context?: string): string {
  if (process.env.NODE_ENV === "development" && context) {
    console.error(`[${context}]`, error);
  }

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Network error occurred"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}
