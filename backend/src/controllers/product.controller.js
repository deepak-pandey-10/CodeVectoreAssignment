const productService = require(
    "../services/product.service"
  );
  
  const getProducts = async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 20;
  
      const page =
        req.query.page ? Number(req.query.page) : null;
  
      const category =
        req.query.category || null;
  
      const cursorTime =
        req.query.cursorTime || null;
  
      const cursorId =
        req.query.cursorId || null;
  
      const result =
        await productService.getProducts({
          limit,
          page,
          category,
          cursorTime,
          cursorId,
        });
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  module.exports = {
    getProducts,
  };
