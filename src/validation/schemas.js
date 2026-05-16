const { z } = require('zod');

const imageItemSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
});

const mediaItemSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  type: z.enum(['image', 'video']).optional(),
});

const productCreateSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().min(1).max(2000),
  material: z.string().min(1),
  isCustomizable: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  categoryId: z.string().uuid(),
  images: z.array(imageItemSchema).optional(),
}).passthrough();

const productUpdateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().min(1).max(2000).optional(),
  material: z.string().min(1).optional(),
  isCustomizable: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  categoryId: z.string().uuid().optional(),
  images: z.array(imageItemSchema).optional(),
}).passthrough().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

const inquiryCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
  country: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  productId: z.string().uuid().optional(),
});

const inquiryUpdateSchema = z.object({ status: z.enum(['new', 'contacted', 'closed']) });

const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

const galleryCreateSchema = z.object({
  type: z.enum(['image', 'video']),
  title: z.string().max(200).optional(),
  media: z.array(mediaItemSchema).optional(),
}).strict();

const galleryUpdateSchema = z.object({
  type: z.enum(['image', 'video']).optional(),
  title: z.string().max(200).optional(),
}).strict().refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

const contactCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

module.exports = {
  productCreateSchema,
  productUpdateSchema,
  inquiryCreateSchema,
  inquiryUpdateSchema,
  categoryCreateSchema,
  galleryCreateSchema,
  galleryUpdateSchema,
  contactCreateSchema,
};

