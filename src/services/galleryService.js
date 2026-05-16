const { prisma } = require('../config/database');
const { cloudinary } = require('../config/cloudinary');
const { validatePagination } = require('../utils/helpers');

const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl) return null;
  // Cloudinary video thumbnail: replace /video/upload/ with /video/upload/so_0/ and extension to .jpg
  return videoUrl
    .replace('/video/upload/', '/video/upload/so_0,w_600,h_600,c_fill/')
    .replace(/\.[^.]+$/, '.jpg');
};

const createGallery = async (mediaData, media) => {
  try {
    if (!media || media.length === 0) throw new Error('No media provided');
    return await prisma.$transaction(media.map((item) => {
      const isVideo = item.type === 'video' || item.url?.includes('/video/upload/');
      const thumbnail = isVideo ? getVideoThumbnail(item.url) : item.url;
      return prisma.gallery.create({
        data: {
          type: item.type || mediaData.type,
          url: item.url,
          publicId: item.publicId,
          thumbnail,
          title: mediaData.title,
        },
      });
    }));
  } catch (error) {
    throw new Error(`Failed to create gallery: ${error.message}`);
  }
};

const getAllGallery = async (page = 1, limit = 10) => {
  try {
    const { page: pageInt, limit: limitInt } = validatePagination(page, limit);
    const skip = (pageInt - 1) * limitInt;
    const gallery = await prisma.gallery.findMany({ skip, take: limitInt, orderBy: { createdAt: "desc" } });
    const total = await prisma.gallery.count();
    return { gallery, pagination: { page: pageInt, limit: limitInt, total, pages: Math.ceil(total / limitInt) } };
  } catch (error) {
    throw new Error(`Failed to fetch gallery: ${error.message}`);
  }
};

const deleteGallery = async (id) => {
  try {
    const galleryItem = await prisma.gallery.findUnique({ where: { id } });
    if (!galleryItem) return null;
    try {
      const resourceType = galleryItem.type === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(galleryItem.publicId, { resource_type: resourceType });
    } catch (e) { console.log(`Cloudinary error: ${e.message}`); }
    return await prisma.gallery.delete({ where: { id } });
  } catch (error) {
    throw new Error(`Failed to delete gallery: ${error.message}`);
  }
};

const updateGallery = async (id, data) => {
  try {
    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) throw new Error('Gallery item not found');
    return await prisma.gallery.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
      },
    });
  } catch (error) {
    throw new Error(`Failed to update gallery: ${error.message}`);
  }
};

module.exports = { createGallery, getAllGallery, deleteGallery, updateGallery };
