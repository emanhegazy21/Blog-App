const notFoundMiddlware = (req, res, next) => {
    res.status(404).json({ massage: "endpoint not found" });
  }

module.exports = notFoundMiddlware