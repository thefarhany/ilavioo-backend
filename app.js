const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const compression = require('compression');

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'CLOUDINARY_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`[ERROR] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

const corsMiddleware = require("./src/middleware/corsMiddleware");
const rateLimiter = require("./src/middleware/rateLimiter");
const productRoutes = require("./src/routes/productRoutes");
const imageRoutes = require("./src/routes/imageRoutes");
const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const inquiryRoutes = require("./src/routes/inquiryRoutes");
const galleryRoutes = require("./src/routes/galleryRoutes");
const testimonialRoutes = require("./src/routes/testimonialRoutes");
const statsRoutes = require("./src/routes/statsRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");
const { prisma } = require("./src/config/database");

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(cookieParser());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(corsMiddleware);

app.use(compression());

app.use("/api", rateLimiter);

app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected'
      },
      error: 'Database connection failed'
    });
  }
});

app.use("/api/products", productRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Only start server if running directly (not imported by Vercel serverless)
if (require.main === module) {
  const server = app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });

  const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database connection closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;

