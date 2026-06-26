function requireAuth(req, res, next) {
  if (req.session && (req.session.usuario || req.session.terapeuta)) {
    return next();
  }

  return res.redirect("/profesionales/login");
}

module.exports = { requireAuth };
