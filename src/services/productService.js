const { prisma } = require("../config/database");
const { cloudinary } = require("../config/cloudinary");
const { generateSlug, sanitizeHtml, validatePagination } = require("../utils/helpers");

const createProduct = async (productData, images, retryCount = 0) => {
  try {
    const slug = await generateSlug(prisma, productData.name);
    if (!productData.categoryId) throw new Error("categoryId is required");

    // Parse arrays — support both JSON arrays and stringified JSON
    let finishing = [];
    let certifications = [];
    try {
      if (productData.finishing) finishing = typeof productData.finishing === 'string' ? JSON.parse(productData.finishing) : productData.finishing;
      if (productData.certifications) certifications = typeof productData.certifications === 'string' ? JSON.parse(productData.certifications) : productData.certifications;
    } catch {
      throw new Error("Invalid JSON format for finishing or certifications");
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug,
        description: productData.description ? sanitizeHtml(productData.description) : undefined,
        material: productData.material,
        dimensions: productData.dimensions,
        weight: productData.weight,
        minPrice: productData.minPrice ? parseInt(productData.minPrice) : null,
        maxPrice: productData.maxPrice ? parseInt(productData.maxPrice) : null,
        moq: productData.moq ? parseInt(productData.moq) : 100,
        leadTime: productData.leadTime || "2-3 weeks",
        finishing: finishing,
        certifications: certifications,
        origin: productData.origin || "Indonesia",
        isCustomizable: productData.isCustomizable === true || productData.isCustomizable === 'true',
        isFeatured: productData.isFeatured === true || productData.isFeatured === 'true',
        status: productData.status || "active",
        ...(images?.length && { images: { create: images.map((img, i) => ({
          url: img.url,
          publicId: img.publicId,
          isPrimary: i === 0,
          sortOrder: i,
        })) } }),
        categoryId: productData.categoryId,
      },
      include: { images: true, category: true },
    });
    return product;
  } catch (error) {
    if (error.code === 'P2002' && retryCount < 3) {
      return createProduct(productData, images, retryCount + 1);
    }
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

const updateProduct = async (id, updateData, images) => {
  try {
    const existingProduct = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!existingProduct) return null;
    let slug = existingProduct.slug;
    if (updateData.name) slug = await generateSlug(prisma, updateData.name);

    const cleanData = {};
    if (updateData.name !== undefined) cleanData.name = updateData.name;
    if (updateData.description !== undefined) cleanData.description = sanitizeHtml(updateData.description);
    if (updateData.material !== undefined) cleanData.material = updateData.material;
    if (updateData.dimensions !== undefined) cleanData.dimensions = updateData.dimensions;
    if (updateData.weight !== undefined) cleanData.weight = updateData.weight;
    if (updateData.minPrice !== undefined) cleanData.minPrice = updateData.minPrice ? parseInt(updateData.minPrice) : null;
    if (updateData.maxPrice !== undefined) cleanData.maxPrice = updateData.maxPrice ? parseInt(updateData.maxPrice) : null;
    if (updateData.moq !== undefined) cleanData.moq = updateData.moq ? parseInt(updateData.moq) : 100;
    if (updateData.leadTime !== undefined) cleanData.leadTime = updateData.leadTime;
    if (updateData.origin !== undefined) cleanData.origin = updateData.origin;
    if (updateData.isCustomizable !== undefined) cleanData.isCustomizable = updateData.isCustomizable;
    if (updateData.isFeatured !== undefined) cleanData.isFeatured = updateData.isFeatured;
    if (updateData.status !== undefined) cleanData.status = updateData.status;
    if (updateData.categoryId !== undefined) cleanData.categoryId = updateData.categoryId;

    if (updateData.finishing !== undefined) {
      try {
        cleanData.finishing = typeof updateData.finishing === 'string' ? JSON.parse(updateData.finishing) : updateData.finishing;
      } catch {
        throw new Error("Invalid JSON format for finishing");
      }
    }
    if (updateData.certifications !== undefined) {
      try {
        cleanData.certifications = typeof updateData.certifications === 'string' ? JSON.parse(updateData.certifications) : updateData.certifications;
      } catch {
        throw new Error("Invalid JSON format for certifications");
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { ...cleanData, slug },
      include: { images: true, category: true },
    });

    // Append new images if provided
    if (images?.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img, index) => ({
          productId: id,
          url: img.url,
          publicId: img.publicId,
          isPrimary: false,
          sortOrder: existingProduct.images.length + index,
        })),
        skipDuplicates: true,
      });
      return await prisma.product.findUnique({ where: { id }, include: { images: true, category: true } });
    }

    return updated;
  } catch (error) {
    if (error.code === 'P2002') throw error;
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

const softDeleteProduct = async (id) => {
  try {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return null;
    return await prisma.product.update({
      where: { id },
      data: { status: "inactive", deletedAt: new Date() },
    });
  } catch (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

const getAllProducts = async (page = 1, limit = 10) => {
  try {
    const { page: pageInt, limit: limitInt } = validatePagination(page, limit);
    const skip = (pageInt - 1) * limitInt;
    const products = await prisma.product.findMany({
      where: { status: "active", deletedAt: null },
      include: { images: true, category: true },
      skip,
      take: limitInt,
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.product.count({ where: { status: "active", deletedAt: null } });
    return {
      products,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

const getPublicProducts = async (filters, page = 1, limit = 10) => {
  try {
    const { page: pageInt, limit: limitInt } = validatePagination(page, limit);
    const skip = (pageInt - 1) * limitInt;
    const where = { status: "active", deletedAt: null };
    if (filters.q) where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
    if (filters.category) where.category = { slug: filters.category };
    if (filters.material) where.material = filters.material;
    const products = await prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      skip,
      take: limitInt,
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.product.count({ where });
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      material: p.material,
      thumbnail: p.images.length > 0 ? p.images[0].url : null,
      category: p.category,
    }));
    return {
      products: formattedProducts,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

const getPublicProductBySlug = async (slug) => {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
    }).then(p => p && p.status === "active" && p.deletedAt === null ? p : null);
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

const deleteImage = async (imageId) => {
  try {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image) return null;
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (e) {
      console.log(`Cloudinary error: ${e.message}`);
    }
    return await prisma.productImage.delete({ where: { id: imageId } });
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

const setPrimaryImage = async (imageId) => {
  try {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });
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
    return await prisma.productImage.findUnique({ where: { id: imageId } });
  } catch (error) {
    throw new Error(`Failed to set primary image: ${error.message}`);
  }
};

const getProductImages = async (productId) => {
  try {
    return await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    throw new Error(`Failed to get product images: ${error.message}`);
  }
};

const addProductImages = async (productId, images) => {
  try {
    await prisma.productImage.createMany({
      data: images.map((img) => ({
        productId,
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      skipDuplicates: true,
    });
    return await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    throw new Error(`Failed to add product images: ${error.message}`);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  softDeleteProduct,
  getAllProducts,
  getPublicProducts,
  getPublicProductBySlug,
  deleteImage,
  setPrimaryImage,
  getProductImages,
  addProductImages,
};

