const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const validateImage = (file) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) 
    return { valid: false, message: 'Invalid file type.' };
  if (file.size > MAX_SIZE) 
    return { valid: false, message: 'File size exceeds 5 MB.' };
  return { valid: true };
};
