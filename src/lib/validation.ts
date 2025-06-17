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
  if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength <= 3) return "medium";
  if (strength <= 4) return "strong";
  return "very-strong";
};
