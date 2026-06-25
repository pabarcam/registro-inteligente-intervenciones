function requireAuth(req, res, next) {
  if (req.session && (req.session.usuario || req.session.terapeuta)) {
    return next();
  }

  return res.redirect("/");
}

module.exports = { requireAuth };
