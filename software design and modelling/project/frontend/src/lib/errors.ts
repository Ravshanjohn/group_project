import axios from "axios";

type ApiErrorResponse = {
  error?: string | { message?: string };
};

export function getErrorMessage(error: unknown, context?: string): string {
  if (process.env.NODE_ENV === "development" && context) {
    console.error(`[${context}]`, error);
  }

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const responseError = error.response?.data?.error;
    return (
      (typeof responseError === "object" ? responseError?.message : responseError) ||
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
