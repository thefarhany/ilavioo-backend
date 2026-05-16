const crypto = require('crypto');
const { supabase } = require("../config/supabase");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require('../middleware/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error)
    return res
      .status(401)
      .json(errorResponse("Invalid credentials", error.message, 401));
  res.cookie("access_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  const csrfToken = crypto.randomBytes(24).toString('hex');
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.json(successResponse({ user: data.user }, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  await supabase.auth.signOut();
  res.clearCookie("access_token");
  res.clearCookie("csrf_token");
  res.json(successResponse({}, "Logout successful"));
});

const me = asyncHandler(async (req, res) => {
  // Try cookie first, then Authorization header
  let token = req.cookies.access_token;
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json(errorResponse("Not authenticated", {}, 401));
  }

  const supabaseWithToken = require("../config/supabase").createAuthenticatedClient(token);
  const { data, error } = await supabaseWithToken.auth.getUser();

  if (error || !data.user) {
    return res.status(401).json(errorResponse("Invalid token", error?.message || "", 401));
  }

  res.json(successResponse({ user: data.user }, "User authenticated"));
});

module.exports = { login, logout, me };
