const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const validateImage = (file) => {
  if (!file) 
    return { valid: false, message: 'File is required.' };
  if (!ALLOWED_TYPES.includes(file.mimetype)) 
    return { valid: false, message: 'Invalid file type.' };
  if (file.size > MAX_SIZE) 
    return { valid: false, message: 'File size exceeds 2MB.' };
  return { valid: true };
};
