const { prisma } = require("../config/database");
const { validatePagination } = require("../utils/helpers");

// Create testimonial
const createTestimonial = async (data) => {
  try {
    return await prisma.testimonial.create({
      data: {
        name: data.name,
        company: data.company,
        country: data.country,
        content: data.content,
        rating: data.rating || 5,
        isActive: data.isActive ?? true,
        imageUrl: data.imageUrl,
      },
    });
  } catch (error) {
    throw new Error("Failed to create testimonial: " + error.message);
  }
};

// Get all testimonials (admin)
const getAllTestimonials = async (page = 1, limit = 10) => {
  try {
    const { page: pageInt, limit: limitInt } = validatePagination(page, limit);
    const skip = (pageInt - 1) * limitInt;
    
    const testimonials = await prisma.testimonial.findMany({
      skip,
      take: limitInt,
      orderBy: { createdAt: "desc" },
    });
    
    const total = await prisma.testimonial.count();
    
    return {
      testimonials,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt),
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch testimonials: " + error.message);
  }
};

// Get active testimonials (public)
const getActiveTestimonials = async (limit = 6) => {
  try {
    const limitNum = typeof limit === "string" ? parseInt(limit, 10) : (limit || 6);
    return await prisma.testimonial.findMany({
      where: { isActive: true },
      take: limitNum,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error("Failed to fetch testimonials: " + error.message);
  }
};

// Update testimonial
const updateTestimonial = async (id, data) => {
  try {
    return await prisma.testimonial.update({
      where: { id },
      data: {
        name: data.name,
        company: data.company,
        country: data.country,
        content: data.content,
        rating: data.rating,
        isActive: data.isActive,
        imageUrl: data.imageUrl,
      },
    });
  } catch (error) {
    throw new Error("Failed to update testimonial: " + error.message);
  }
};

// Delete testimonial
const deleteTestimonial = async (id) => {
  try {
    return await prisma.testimonial.delete({ where: { id } });
  } catch (error) {
    throw new Error("Failed to delete testimonial: " + error.message);
  }
};

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getActiveTestimonials,
  updateTestimonial,
  deleteTestimonial,
};
