const Brand = require('../../../models/brand');
const Category = require('../../../models/category');
const { param } = require('../../../routes/admin/categories');

async function buildProductQuery(params) {
    let andConditions = [];

    
    if (params.search) {
        const brandMatches = await Brand.find({
            name: { $regex: params.search, $options: 'i' }
        }).select('_id');

        const categoryMatches = await Category.find({
            name: { $regex: params.search, $options: 'i' }
        }).select('_id');

        andConditions.push({
            $or: [
                { name: { $regex: params.search, $options: 'i' } },
                { brand: { $in: brandMatches.map(b => b._id) } },
                { category: { $in: categoryMatches.map(c => c._id) } }
            ]
        });
    }

   
    if (params.brand) {
        andConditions.push({
            brand: { $in: Array.isArray(params.brand) ? params.brand : [params.brand] }
        });
    }

    
    if (params.category) {
        andConditions.push({
            category: { $in: Array.isArray(params.category) ? params.category : [params.category] }
        });
    }

    
    if (params.price) {
        const priceFilter = Array.isArray(params.price) ? params.price : [params.price];
        const priceConditions = priceFilter.map(range => {
            const [min, max] = range.split('-').map(v => v ? parseInt(v) : null);
            return max
                ? { price: { $gte: min, $lte: max } }
                : { price: { $gte: min } };
        });
        andConditions.push({ $or: priceConditions });
    }

    return andConditions.length > 0 ? { $and: andConditions } : {};
}

module.exports = { buildProductQuery };
