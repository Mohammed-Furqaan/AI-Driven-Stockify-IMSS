const checkAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    next();
  } catch (error) {
    console.error("Error in checkAdmin middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in authorization",
    });
  }
};

export default checkAdmin;
