const { prisma } = require('../config/database');

const getDashboardStats = async () => {
  try {
    const [totalProducts, totalInquiries, totalGalleryItems, newInquiries] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.inquiry.count(),
      prisma.gallery.count(),
      prisma.inquiry.count({ where: { status: 'new' } }),
    ]);

    return {
      totalProducts,
      totalInquiries,
      totalGalleryItems,
      newInquiries,
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }
};

module.exports = { getDashboardStats };

