import { validateImage } from '../utils/validation/fileImage.js';

const imageValidationMiddleware = (req, res, next) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'At least one file is required.' });
  }

  for (const file of files) {
    const { valid, message } = validateImage(file);
    if (!valid) {
      return res.status(400).json({ message });
    }
  }

  next();
};

export default imageValidationMiddleware;
