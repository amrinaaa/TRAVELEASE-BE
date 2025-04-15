import { validateImage } from '../utils/validation/fileImage.js';

const imageValidationMiddleware = (req, res, next) => {
  const { valid, message } = validateImage(req.file);
  if (!valid) return res.status(400).json({ message });
  next();
};

export default imageValidationMiddleware;
