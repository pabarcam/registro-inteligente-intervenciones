function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }

  return res.redirect("/");
}

module.exports = { requireAuth };
