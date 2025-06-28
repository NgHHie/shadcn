// Validation utilities for authentication forms

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Vietnamese phone numbers)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(84|0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "Mật khẩu không được để trống" };
  }

  if (password.length < 6) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: "Mật khẩu không được vượt quá 128 ký tự",
    };
  }

  // Check for at least one letter and one number
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số",
    };
  }

  return { isValid: true };
};

// Age validation
export const validateAge = (birthDay: string): ValidationResult => {
  if (!birthDay) {
    return { isValid: false, message: "Ngày sinh không được để trống" };
  }

  const birthDate = new Date(birthDay);
  const today = new Date();

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: "Ngày sinh không hợp lệ" };
  }

  // Check if birth date is not in the future
  if (birthDate > today) {
    return { isValid: false, message: "Ngày sinh không thể ở tương lai" };
  }

  // Calculate age
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    const actualAge = age - 1;
    if (actualAge < 13) {
      return { isValid: false, message: "Bạn phải ít nhất 13 tuổi để đăng ký" };
    }
  } else if (age < 13) {
    return { isValid: false, message: "Bạn phải ít nhất 13 tuổi để đăng ký" };
  }

  if (age > 120) {
    return { isValid: false, message: "Ngày sinh không hợp lệ" };
  }

  return { isValid: true };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  if (!username.trim()) {
    return { isValid: false, message: "Tên đăng nhập không được để trống" };
  }

  if (username.length < 3) {
    return { isValid: false, message: "Tên đăng nhập phải có ít nhất 3 ký tự" };
  }

  if (username.length > 50) {
    return {
      isValid: false,
      message: "Tên đăng nhập không được vượt quá 50 ký tự",
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới",
    };
  }

  return { isValid: true };
};

// Name validation
export const validateName = (
  name: string,
  fieldName: string
): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }

  if (name.length < 2) {
    return { isValid: false, message: `${fieldName} phải có ít nhất 2 ký tự` };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      message: `${fieldName} không được vượt quá 50 ký tự`,
    };
  }

  return { isValid: true };
};

// Calculate password strength
export const getPasswordStrength = (
  password: string
): "weak" | "medium" | "strong" | "very-strong" | null => {
  if (!password) return null;

  let strength = 0;

  // Length check
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;

  // Character variety checks
  if (/(?=.*[a-z])/.test(password)) strength++;
  if (/(?=.*[A-Z])/.test(password)) strength++;
  if (/(?=.*\d)/.test(password)) strength++;
  if (/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength <= 3) return "medium";
  if (strength <= 4) return "strong";
  return "very-strong";
};

// Profile update validation
export const validateProfileUpdate = (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthDay?: string;
  password?: string;
  repassword?: string;
}): ValidationResult => {
  // Validate first name
  if (data.firstName !== undefined) {
    const firstNameValidation = validateName(data.firstName, "Họ");
    if (!firstNameValidation.isValid) {
      return firstNameValidation;
    }
  }

  // Validate last name
  if (data.lastName !== undefined) {
    const lastNameValidation = validateName(data.lastName, "Tên");
    if (!lastNameValidation.isValid) {
      return lastNameValidation;
    }
  }

  // Validate email
  if (data.email !== undefined && data.email.trim()) {
    if (!isValidEmail(data.email)) {
      return { isValid: false, message: "Email không hợp lệ" };
    }
  }

  // Validate phone
  if (data.phone !== undefined && data.phone.trim()) {
    if (!isValidPhone(data.phone)) {
      return { isValid: false, message: "Số điện thoại không hợp lệ" };
    }
  }

  // Validate birth day
  if (data.birthDay !== undefined && data.birthDay.trim()) {
    const birthDayValidation = validateAge(data.birthDay);
    if (!birthDayValidation.isValid) {
      return birthDayValidation;
    }
  }

  // Validate password if provided
  if (data.password !== undefined && data.password.trim()) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    // Check password confirmation
    if (data.repassword !== data.password) {
      return { isValid: false, message: "Mật khẩu xác nhận không khớp" };
    }
  }

  return { isValid: true };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("84")) {
    return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(
      8
    )}`;
  }
  if (cleaned.startsWith("0")) {
    return `0${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// Format date for API (YYYY-MM-DD)
export const formatDateForAPI = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};
