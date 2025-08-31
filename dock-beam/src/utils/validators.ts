/**
 * A collection of reusable validation and masking functions for Brazilian data formats.
 */

// --- VALIDATION FUNCTIONS ---

/**
 * Validates an email format using a regular expression.
 * @param email The email string to validate.
 * @returns `true` if the email format is valid, otherwise `false`.
 */
export const isEmailValid = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a Brazilian CPF number, including check digits.
 * @param cpf The CPF string, which can include formatting.
 * @returns `true` if the CPF is valid, otherwise `false`.
 */
export const isCPFValid = (cpf: string): boolean => {
  if (!cpf) return false;
  const cleanCpf = cpf.replace(/\D/g, ''); // Removes non-digit characters
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) {
    return false; // CPF must have 11 digits and not all digits can be the same
  }
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleanCpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleanCpf.substring(10, 11))) return false;
  return true;
};

/**
 * Validates a Brazilian CNPJ number, including check digits.
 * @param cnpj The CNPJ string, which can include formatting.
 * @returns `true` if the CNPJ is valid, otherwise `false`.
 */
export const isCNPJValid = (cnpj: string): boolean => {
    if (!cnpj) return false;
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14 || /^(\d)\1+$/.test(cleanCnpj)) {
        return false;
    }
    let size = cleanCnpj.length - 2;
    let numbers = cleanCnpj.substring(0, size);
    const digits = cleanCnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    size = size + 1;
    numbers = cleanCnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    return true;
};


/**
 * Validates a Brazilian phone number (10 or 11 digits).
 * @param phone The phone number string, which can include formatting.
 * @returns `true` if the phone number is valid, otherwise `false`.
 */
export const isPhoneValid = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

// --- MASKING FUNCTIONS ---

/** Formats a string into the CPF format (XXX.XXX.XXX-XX). */
export const formatCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

/** Formats a string into the CNPJ format (XX.XXX.XXX/XXXX-XX). */
export const formatCNPJ = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
};

/** Formats a string into the Brazilian phone format ((XX) XXXXX-XXXX). */
export const formatPhone = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})/, '$1-$2') // For mobile phones
    .replace(/(\d{4})(\d{4})/, '$1-$2') // For landlines
    .slice(0, 15);
};