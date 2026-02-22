const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Product = require('../../models/product');
const Review = require('../../models/review');
const { getEligibleDeliveredItem } = require('./reviewController');


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
    })
      .populate("category")
      .limit(4); // show only 4

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const userId = req.session.userId;
    let canReview = false;
    let currentUserReview = null;
    if (userId) {
      currentUserReview = await Review.findOne({ user: userId, product: productId });
      const eligible = await getEligibleDeliveredItem(userId, productId);
      canReview = Boolean(eligible);
    }

    res.render('user/product-details', {
      product,
      brands,
      categories,
      relatedProducts,
      reviews,
      canReview,
      currentUserReview,
      reviewStatus: req.query.reviewStatus || null
    });
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getProductDetails,
};
