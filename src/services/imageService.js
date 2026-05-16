const { prisma } = require("../config/database");
const { cloudinary } = require("../config/cloudinary");

const uploadImages = async (productId, files) => {
  const existingImages = await prisma.productImage.findMany({
    where: { productId },
  });
  
  // CloudinaryStorage returns:
  // file.path = full Cloudinary URL
  // file.filename = public_id (e.g., "products/1234567890_image.jpg")
  // file.originalname = original filename
  const images = files.map((file, index) => ({
    productId,
    url: file.path, // This is the Cloudinary URL
    publicId: file.filename, // This is the public_id from Cloudinary
    isPrimary: index === 0 && existingImages.length === 0,
    sortOrder: existingImages.length + index,
  }));
  
  await prisma.productImage.createMany({
    data: images,
    skipDuplicates: true,
  });
  
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
};

const getProductImages = async (productId) => {
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
};

const deleteImage = async (imageId) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return null;
  try {
    await cloudinary.uploader.destroy(image.publicId);
  } catch (e) {
    console.log(`Cloudinary error: ${e.message}`);
  }
  return prisma.productImage.delete({ where: { id: imageId } });
};

const setPrimaryImage = async (imageId) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return null;
  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId: image.productId, isPrimary: true },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true, sortOrder: 0 },
    }),
  ]);
  return prisma.productImage.findUnique({ where: { id: imageId } });
};

module.exports = { uploadImages, getProductImages, deleteImage, setPrimaryImage };
