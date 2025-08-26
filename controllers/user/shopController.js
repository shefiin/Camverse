const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Product = require('../../models/product');
const { buildProductQuery } = require('../user/helpers/buildProductQuery');

const loadShopPage = async (req, res) => {
    try {
        const user = req.user || null;
        const page = parseInt(req.query.page) || 1;
        const limit = 12;

        const activeBrands = await Brand.find({ isDeleted: false }).select('_id');
        const activeCategories = await Category.find({ isDeleted: false }).select('_id');


        const query = await buildProductQuery(req.query);
        query.isDeleted = { $ne: true };
        query.brand = { $in: activeBrands.map(b => b._id)};
        query.category = { $in: activeCategories.map(c => c._id)};

        let sortOption = {};
        switch (req.query.sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'alpha_asc':
                sortOption = { name: 1 };
                break;
            case 'alpha_desc':
                sortOption = { name: -1 };
                break;
            default:
                sortOption = { createdAt: -1 }; 
                break;
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(query)
            .populate('brand')
            .populate('category')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit);

        const brands = await Brand.find({isDeleted: false});
        const categories = await Category.find({isDeleted: false});    

        const priceRanges = [
            { label: '₹10K - 25K', min: 10000, max: 25000 },
            { label: '₹25K - 40K', min: 25000, max: 40000 },
            { label: '₹40K - 70K', min: 40000, max: 70000 },
            { label: '₹70K - 1 Lakh', min: 70000, max: 100000 },
            { label: '₹1 Lakh and above', min: 100000, max: null }
        ];

        res.render('user/shop', {
            user,
            brands,
            categories,
            products,
            search: req.query.search || '',
            currentPage: page,
            totalPages,
            totalProducts,
            limit,
            queryParams: req.query,
            priceRanges,
            
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
};


const getProductsByCategory = async (req, res) => {
    try {
      const categoryId = req.params.id;
      const user = req.user || null;
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
  
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).render('404', { message: 'Category not found' });
      }
  

      const brands = await Brand.find();
      const categories = await Category.find();
  
      let query = await buildProductQuery(req.query);
      query.category = categoryId;
  
      let sortOption = {};
      switch (req.query.sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'alpha_asc':
          sortOption = { name: 1 };
          break;
        case 'alpha_desc':
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 }; 
      }
  
      
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
  
      
      const products = await Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
  
      
      const priceRanges = [
        { label: '₹10K - 25K', min: 10000, max: 25000 },
        { label: '₹25K - 40K', min: 25000, max: 40000 },
        { label: '₹40K - 70K', min: 40000, max: 70000 },
        { label: '₹70K - 1 Lakh', min: 70000, max: 100000 },
        { label: '₹1 Lakh and above', min: 100000, max: null },
      ];
  
      
      res.render('user/shop', {
        user,
        brands,
        categories,
        products,
        search: req.query.search || '',
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
        queryParams: req.query,
        priceRanges,
        selectedCategory: categoryId 
      });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).render('500', { message: 'Internal Server Error' });
    }
  };


  const getProductsByBrand = async (req, res) => {
    try {
      const brandId = req.params.id;
      const user = req.user || null;
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
  
      
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).render('404', { message: 'Brand not found' });
      }
  
      const brands = await Brand.find();
      const categories = await Category.find();
  
      
      let query = await buildProductQuery(req.query);
  
      
      query.brand = brandId;
  
      
      let sortOption = {};
      switch (req.query.sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'alpha_asc':
          sortOption = { name: 1 };
          break;
        case 'alpha_desc':
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
  
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
  
      const products = await Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
  
      const priceRanges = [
        { label: '₹10K - 25K', min: 10000, max: 25000 },
        { label: '₹25K - 40K', min: 25000, max: 40000 },
        { label: '₹40K - 70K', min: 40000, max: 70000 },
        { label: '₹70K - 1 Lakh', min: 70000, max: 100000 },
        { label: '₹1 Lakh and above', min: 100000, max: null },
      ];
  
      res.render('user/shop', {
        user,
        brands,
        categories,
        products,
        search: req.query.search || '',
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
        queryParams: req.query,
        priceRanges,
        selectedBrand: brandId, 
      });
    } catch (error) {
      console.error('Error fetching products by brand:', error);
      res.status(500).render('500', { message: 'Internal Server Error' });
    }
  };
  
  



module.exports = { loadShopPage, getProductsByCategory, getProductsByBrand };
