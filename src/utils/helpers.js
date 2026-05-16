const sanitizeHtml = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "");
};

const validatePagination = (page, limit, maxLimit = 100) => {
  const pageInt = Math.max(1, parseInt(page) || 1);
  const limitInt = Math.min(Math.max(1, parseInt(limit) || 10), maxLimit);
  return { page: pageInt, limit: limitInt };
};

const generateSlug = async (prisma, name, model = "product", maxRetries = 3) => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Name is required to generate a slug");
  }
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const allowedModels = ["product", "category"];
  const safeModel = allowedModels.includes(model) ? model : "product";
  let slug = base;
  let counter = 0;
  while (await prisma[safeModel].findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
};

module.exports = { validatePagination, generateSlug, sanitizeHtml };

