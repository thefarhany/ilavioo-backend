const crypto = require('crypto');

module.exports = function csrfProtection(req, res, next) {
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (unsafeMethods.includes(req.method)) {
    const token = req.get('x-csrf-token');
    const cookieToken = req.cookies.csrf_token;
    
    if (!token || !cookieToken) {
      console.log('[CSRF] Missing token. Header: ' + (token ? 'yes' : 'no') + ', Cookie: ' + (cookieToken ? 'yes' : 'no'));
      return res.status(403).json({ success: false, message: 'CSRF validation failed - missing token' });
    }
    
    try {
      if (token.length !== cookieToken.length) {
        console.log('[CSRF] Token length mismatch');
        return res.status(403).json({ success: false, message: 'CSRF validation failed' });
      }
      const tokenBuf = Buffer.from(token);
      const cookieBuf = Buffer.from(cookieToken);
      if (!crypto.timingSafeEqual(tokenBuf, cookieBuf)) {
        console.log('[CSRF] Token mismatch');
        return res.status(403).json({ success: false, message: 'CSRF validation failed' });
      }
    } catch (err) {
      console.log('[CSRF] Error during validation: ' + err.message);
      return res.status(403).json({ success: false, message: 'CSRF validation failed' });
    }
  }
  next();
};
