// Error handling utility for API responses

interface ApiError {
  message?: string;
  status?: number;
  code?: number;
  response?: {
    data?: {
      message?: string;
      errors?: Array<{ message?: string } | string>;
    };
    status?: number;
  };
}

export const parseApiError = (error: unknown): string => {
  // If error is already a string, return as is
  if (typeof error === "string") {
    return error;
  }

  // Type guard to check if error has expected properties
  const apiError = error as ApiError;

  // First priority: Check actual server response message
  if (apiError?.response?.data?.message) {
    const serverMessage = apiError.response.data.message;

    // Check for specific Vietnamese error messages from server
    if (
      serverMessage.toLowerCase().includes("tài khoản") &&
      serverMessage.toLowerCase().includes("tồn tại")
    ) {
      return "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
    }

    if (
      serverMessage.toLowerCase().includes("username") &&
      (serverMessage.toLowerCase().includes("exist") ||
        serverMessage.toLowerCase().includes("taken") ||
        serverMessage.toLowerCase().includes("already"))
    ) {
      return "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
    }

    if (
      serverMessage.toLowerCase().includes("email") &&
      (serverMessage.toLowerCase().includes("exist") ||
        serverMessage.toLowerCase().includes("taken") ||
        serverMessage.toLowerCase().includes("already"))
    ) {
      return "Email đã được sử dụng. Vui lòng sử dụng email khác.";
    }

    // Return the actual server message if it's meaningful
    if (
      serverMessage.length > 5 &&
      !serverMessage.includes("500") &&
      !serverMessage.includes("Error")
    ) {
      return serverMessage;
    }
  }

  // Handle validation errors
  if (apiError?.response?.data?.errors) {
    const errors = apiError.response.data.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];
      if (typeof firstError === "string") {
        return firstError;
      }
      return firstError?.message || "Lỗi validation";
    }
  }

  // Handle HTTP status codes from response
  const statusCode =
    apiError?.response?.status || apiError?.status || apiError?.code;
  if (statusCode) {
    switch (statusCode) {
      case 400:
        return "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
      case 401:
        return "Không có quyền truy cập. Vui lòng đăng nhập lại.";
      case 403:
        return "Bạn không có quyền thực hiện thao tác này.";
      case 404:
        return "Không tìm thấy tài nguyên yêu cầu.";
      case 409:
        return "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
      case 422:
        return "Thông tin không đúng định dạng. Vui lòng kiểm tra lại.";
      case 429:
        return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
      case 500:
        return "Lỗi server. Vui lòng thử lại sau.";
      case 502:
      case 503:
      case 504:
        return "Server đang bảo trì. Vui lòng thử lại sau.";
      default:
        return `Có lỗi xảy ra (${statusCode}). Vui lòng thử lại.`;
    }
  }

  // If error has a message property (for other types of errors)
  if (apiError?.message) {
    // Handle HTTP errors with status codes in message
    if (apiError.message.includes("400")) {
      return "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
    }
    if (apiError.message.includes("409")) {
      return "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
    }
    if (apiError.message.includes("422")) {
      return "Thông tin không đúng định dạng. Vui lòng kiểm tra lại.";
    }
    if (apiError.message.includes("500")) {
      return "Lỗi server. Vui lòng thử lại sau.";
    }
    if (apiError.message.includes("Network")) {
      return "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
    }

    // Return the original message if it's user-friendly
    return apiError.message;
  }

  // Fallback for unknown errors
  console.error("Unknown error:", error);
  return "Có lỗi không xác định xảy ra. Vui lòng thử lại.";
};

// Specific error handlers for common scenarios
export const handleRegistrationError = (error: unknown): string => {
  const message = parseApiError(error);

  // Check for Vietnamese messages first
  if (
    message.toLowerCase().includes("tài khoản") &&
    message.toLowerCase().includes("tồn tại")
  ) {
    return "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
  }

  // Common registration-specific errors in English
  if (
    (message.toLowerCase().includes("username") ||
      message.toLowerCase().includes("user")) &&
    (message.toLowerCase().includes("exist") ||
      message.toLowerCase().includes("taken") ||
      message.toLowerCase().includes("already") ||
      message.toLowerCase().includes("duplicate"))
  ) {
    return "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
  }

  if (
    message.toLowerCase().includes("email") &&
    (message.toLowerCase().includes("exist") ||
      message.toLowerCase().includes("taken") ||
      message.toLowerCase().includes("already") ||
      message.toLowerCase().includes("duplicate"))
  ) {
    return "Email đã được sử dụng. Vui lòng sử dụng email khác.";
  }

  if (
    message.toLowerCase().includes("password") &&
    message.toLowerCase().includes("weak")
  ) {
    return "Mật khẩu không đáp ứng yêu cầu bảo mật.";
  }

  if (
    message.toLowerCase().includes("validation") ||
    message.toLowerCase().includes("invalid")
  ) {
    return "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
  }

  // If message is too generic or technical, provide user-friendly message
  if (message.includes("400") || message.includes("Bad Request")) {
    return "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.";
  }

  return message;
};

export const handleLoginError = (error: unknown): string => {
  const message = parseApiError(error);

  // Common login-specific errors
  if (
    message.toLowerCase().includes("invalid credentials") ||
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("wrong password") ||
    message.toLowerCase().includes("invalid username")
  ) {
    return "Tên đăng nhập hoặc mật khẩu không chính xác.";
  }

  if (message.toLowerCase().includes("account locked")) {
    return "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.";
  }

  if (message.toLowerCase().includes("account disabled")) {
    return "Tài khoản đã bị vô hiệu hóa.";
  }

  return message;
};

// Handler for data fetching errors (questions, quizzes, etc.)
export const handleDataFetchError = (error: unknown): string => {
  const message = parseApiError(error);

  // Check if it's a network error
  if (
    message.toLowerCase().includes("network") ||
    message.toLowerCase().includes("timeout")
  ) {
    return "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
  }

  // Check if it's a server error
  if (
    message.toLowerCase().includes("500") ||
    message.toLowerCase().includes("server")
  ) {
    return "Server đang gặp sự cố. Vui lòng thử lại sau.";
  }

  // Check if it's an authentication error
  if (
    message.toLowerCase().includes("401") ||
    message.toLowerCase().includes("unauthorized")
  ) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  // Check if it's a permission error
  if (
    message.toLowerCase().includes("403") ||
    message.toLowerCase().includes("forbidden")
  ) {
    return "Bạn không có quyền truy cập tài nguyên này.";
  }

  return message;
};
