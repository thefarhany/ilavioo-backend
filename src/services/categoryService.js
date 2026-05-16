const { prisma } = require("../config/database");
const { generateSlug, validatePagination } = require("../utils/helpers");

const createCategory = async (name, retryCount = 0) => {
  try {
    const slug = await generateSlug(prisma, name, "category");
    return await prisma.category.create({
      data: { name, slug },
    });
  } catch (error) {
    if (error.code === 'P2002' && retryCount < 3) {
      return createCategory(name, retryCount + 1);
    }
    throw new Error(`Failed to create category: ${error.message}`);
  }
};

const getAllCategories = async (page = 1, limit = 50) => {
  try {
    const { page: pageInt, limit: limitInt } = validatePagination(page, limit);
    const skip = (pageInt - 1) * limitInt;
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      skip,
      take: limitInt,
    });
    const total = await prisma.category.count();
    return {
      categories,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
};

const updateCategory = async (id, name) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new Error("Category not found");
    const slug = await generateSlug(prisma, name, "category");
    return await prisma.category.update({
      where: { id },
      data: { name, slug },
    });
  } catch (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

const deleteCategory = async (id) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id }, include: { products: true } });
    if (!existing) throw new Error("Category not found");
    if (existing.products.length > 0) {
      throw new Error("Cannot delete category that has products");
    }
    await prisma.category.delete({ where: { id } });
    return true;
  } catch (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };

