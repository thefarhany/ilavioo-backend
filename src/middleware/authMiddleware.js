const { createAuthenticatedClient } = require("../config/supabase");
const { errorResponse } = require("../utils/responseHelper");

const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.access_token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }
    if (!token)
      return res
        .status(401)
        .json(errorResponse("Access token missing", {}, 401));

    const supabaseWithToken = createAuthenticatedClient(token);
    const { data, error } = await supabaseWithToken.auth.getUser();
    if (error || !data.user)
      return res
        .status(401)
        .json(errorResponse("Unauthorized", error?.message || "", 401));
    req.user = data.user;
    next();
  } catch (error) {
    res.status(500).json(errorResponse("Authentication failure"));
  }
};

module.exports = { authenticate };
