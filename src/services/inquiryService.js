const { prisma } = require("../config/database");
const { validatePagination } = require("../utils/helpers");

const createInquiry = async (inquiryData) => {
  try {
    const productId = inquiryData.productId || inquiryData.product_id;
    return await prisma.inquiry.create({
      data: {
        name: inquiryData.name,
        email: inquiryData.email,
        message: inquiryData.message,
        country: inquiryData.country,
        company: inquiryData.company,
        status: "new",
        product: productId ? { connect: { id: productId } } : undefined,
      },
      include: { product: true },
    });
  } catch (error) {
    throw new Error(`Failed to create inquiry: ${error.message}`);
  }
};

const getAllInquiries = async (page = 1, limit = 10) => {
  try {
    const { page: pageInt, limit: limitInt } = validatePagination(page, limit);
    const skip = (pageInt - 1) * limitInt;
    const inquiries = await prisma.inquiry.findMany({
      include: { product: true },
      skip,
      take: limitInt,
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.inquiry.count();
    return {
      inquiries,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch inquiries: ${error.message}`);
  }
};

const updateInquiry = async (id, updateData) => {
  try {
    const existingInquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!existingInquiry) return null;
    return await prisma.inquiry.update({
      where: { id },
      data: { status: updateData.status },
      include: { product: true },
    });
  } catch (error) {
    throw new Error(`Failed to update inquiry: ${error.message}`);
  }
};

const getPublicInquiries = async (page = 1, limit = 10) => {
  try {
    const { page: pageInt, limit: limitInt } = validatePagination(page, limit);
    const skip = (pageInt - 1) * limitInt;
    const inquiries = await prisma.inquiry.findMany({
      where: { status: "new" },
      select: {
        id: true,
        name: true,
        country: true,
        company: true,
        createdAt: true,
        product: { select: { id: true, name: true, slug: true } },
      },
      skip,
      take: limitInt,
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.inquiry.count({ where: { status: "new" } });
    return {
      inquiries,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch inquiries: ${error.message}`);
  }
};

module.exports = {
  createInquiry,
  getAllInquiries,
  updateInquiry,
  getPublicInquiries,
};
