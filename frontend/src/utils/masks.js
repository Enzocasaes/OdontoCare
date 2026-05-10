/**
 * Removes all non-numeric characters
 */
export const removeNonNumeric = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Normalizes email by trimming spaces and lowercasing.
 */
export const maskEmail = (value) => {
  if (!value) return '';
  return value.trim().toLowerCase().replace(/\s+/g, '');
};

/**
 * Masks phone number: (XX) XXXXX-XXXX
 */
export const maskPhone = (value) => {
  const cleaned = removeNonNumeric(value);
  if (!cleaned) return '';
  
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

/**
 * Masks CPF: XXX.XXX.XXX-XX
 */
export const maskCPF = (value) => {
  const cleaned = removeNonNumeric(value);
  if (!cleaned) return '';
  
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

/**
 * Masks CNPJ: XX.XXX.XXX/XXXX-XX
 */
export const maskCNPJ = (value) => {
  const cleaned = removeNonNumeric(value);
  if (!cleaned) return '';
  
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

/**
 * Masks currency: R$ X.XXX,XX
 */
export const maskCurrency = (value) => {
  const cleaned = removeNonNumeric(value);
  if (!cleaned) return '';
  
  const formatted = (parseInt(cleaned, 10) || 0).toString().padStart(3, '0');
  const integerPart = formatted.slice(0, -2) || '0';
  const decimalPart = formatted.slice(-2);
  
  const parts = [];
  for (let i = integerPart.length; i > 0; i -= 3) {
    parts.unshift(integerPart.slice(Math.max(0, i - 3), i));
  }
  
  return `R$ ${parts.join('.')},${decimalPart}`;
};

/**
 * Allows only letters and spaces
 */
export const maskOnlyLetters = (value) => {
  if (!value) return '';
  return value.replace(/[^a-zA-Zá-üÁ-Ü\s]/g, '');
};

/**
 * Allows only letters, numbers, spaces and hyphens
 */
export const maskAlphanumeric = (value) => {
  if (!value) return '';
  return value.replace(/[^a-zA-Zá-üÁ-Ü0-9\s-]/g, '');
};

/**
 * Masks time: HH:MM
 */
export const maskTime = (value) => {
  const cleaned = removeNonNumeric(value);
  if (!cleaned) return '';
  
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length === 1) return `0${cleaned}`;
  
  const hours = Math.min(parseInt(cleaned.slice(0, 2), 10), 23);
  const minutes = Math.min(parseInt(cleaned.slice(2, 4), 10) || 0, 59);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
