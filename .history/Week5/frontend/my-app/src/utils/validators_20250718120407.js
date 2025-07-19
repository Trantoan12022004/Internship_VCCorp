// Validation functions

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.join(', ')
  };
};

// Name validation
export const validateName = (name) => {
  const isValid = name && name.trim().length >= 2 && name.trim().length <= 50;
  return {
    isValid,
    message: isValid ? '' : 'Name must be between 2 and 50 characters'
  };
};

// Phone validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return {
    isValid: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? '' : 'Please enter a valid phone number'
  };
};

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url);
    return {
      isValid: true,
      message: ''
    };
  } catch {
    return {
      isValid: false,
      message: 'Please enter a valid URL'
    };
  }
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  const isValid = value !== null && value !== undefined && value.toString().trim().length > 0;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} is required`
  };
};

// Minimum length validation
export const validateMinLength = (value, minLength, fieldName = 'Field') => {
  const isValid = value && value.toString().length >= minLength;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be at least ${minLength} characters long`
  };
};

// Maximum length validation
export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  const isValid = !value || value.toString().length <= maxLength;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be no more than ${maxLength} characters long`
  };
};

// Number validation
export const validateNumber = (value, fieldName = 'Field') => {
  const isValid = !isNaN(value) && isFinite(value);
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be a valid number`
  };
};

// Min value validation
export const validateMinValue = (value, minValue, fieldName = 'Field') => {
  const isValid = !isNaN(value) && Number(value) >= minValue;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be at least ${minValue}`
  };
};

// Max value validation
export const validateMaxValue = (value, maxValue, fieldName = 'Field') => {
  const isValid = !isNaN(value) && Number(value) <= maxValue;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be no more than ${maxValue}`
  };
};

// Date validation
export const validateDate = (dateString, fieldName = 'Date') => {
  const date = new Date(dateString);
  const isValid = !isNaN(date.getTime());
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be a valid date`
  };
};

// Future date validation
export const validateFutureDate = (dateString, fieldName = 'Date') => {
  const date = new Date(dateString);
  const now = new Date();
  const isValid = !isNaN(date.getTime()) && date > now;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be a future date`
  };
};

// Past date validation
export const validatePastDate = (dateString, fieldName = 'Date') => {
  const date = new Date(dateString);
  const now = new Date();
  const isValid = !isNaN(date.getTime()) && date < now;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be a past date`
  };
};

// Age validation
export const validateAge = (birthDate, minAge = 18, maxAge = 120) => {
  const birth = new Date(birthDate);
  const now = new Date();
  const age = Math.floor((now - birth) / (365.25 * 24 * 60 * 60 * 1000));
  
  const isValid = age >= minAge && age <= maxAge;
  return {
    isValid,
    message: isValid ? '' : `Age must be between ${minAge} and ${maxAge} years`
  };
};

// File validation
export const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  const errors = [];
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.join(', ')
  };
};

// Credit card validation (basic Luhn algorithm)
export const validateCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return {
      isValid: false,
      message: 'Credit card number must be between 13 and 19 digits'
    };
  }
  
  let sum = 0;
  let alternate = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned.charAt(i), 10);
    
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    
    sum += n;
    alternate = !alternate;
  }
  
  const isValid = sum % 10 === 0;
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid credit card number'
  };
};

// Form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const field in validationRules) {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        break; // Stop at first error for each field
      }
    }
  }
  
  return {
    isValid,
    errors
  };
};
