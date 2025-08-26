const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Product = require('../../models/product');


const getProductDetails = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId)
      .populate('brand')
      .populate('category')

    if (!product || 
        product.isDeleted === true || 
        product.brand.isDeleted === true || 
        product.category.isDeleted === true
       ) {
      return res.redirect('/shop')
    }
  

    const brands = await Brand.find({ isDeleted: false });
    const categories = await Category.find({ isDeleted: false });

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4); // show only 4

    res.render('user/product-details', { product, brands, categories, relatedProducts });
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getProductDetails,
};
