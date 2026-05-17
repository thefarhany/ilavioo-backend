const crypto = require('crypto');
const { supabase } = require("../config/supabase");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require('../middleware/asyncHandler');

// Cookie config: lax+http on localhost, none+https on production
const getCookieConfig = (req) => {
  const origin = req.headers.origin || '';
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  return {
    secure: !isLocalhost,
    sameSite: isLocalhost ? 'lax' : 'none',
  };
};

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

  const { secure, sameSite } = getCookieConfig(req);

  res.cookie("access_token", data.session.access_token, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.cookie("refresh_token", data.session.refresh_token, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  const csrfToken = crypto.randomBytes(24).toString('hex');
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false,
    secure,
    sameSite,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.json(successResponse({ user: data.user }, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  await supabase.auth.signOut();
  const { secure, sameSite } = getCookieConfig(req);
  res.clearCookie("access_token", { path: "/", sameSite, secure });
  res.clearCookie("refresh_token", { path: "/", sameSite, secure });
  res.clearCookie("csrf_token", { path: "/", sameSite, secure });
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

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    res.clearCookie("access_token");
    res.clearCookie("csrf_token");
    return res.status(401).json(errorResponse("No refresh token", {}, 401));
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      res.clearCookie("csrf_token");
      return res
        .status(401)
        .json(errorResponse("Session expired", data.error?.message || "", 401));
    }

    const { secure, sameSite } = getCookieConfig(req);

    res.cookie("access_token", data.access_token, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const csrfToken = crypto.randomBytes(24).toString("hex");
    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json(successResponse({ user: data.user }, "Token refreshed"));
  } catch (err) {
    const { secure, sameSite } = getCookieConfig(req);
    res.clearCookie("access_token", { path: "/", sameSite, secure });
    res.clearCookie("refresh_token", { path: "/", sameSite, secure });
    res.clearCookie("csrf_token", { path: "/", sameSite, secure });
    return res.status(500).json(errorResponse("Refresh failed", err.message, 500));
  }
});

module.exports = { login, logout, me, refresh };
