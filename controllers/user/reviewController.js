const mongoose = require('mongoose');
const Order = require('../../models/order');
const Review = require('../../models/review');
const Product = require('../../models/product');

const getSafeRedirectPath = (redirectTo, fallback = '/') => {
  if (typeof redirectTo !== 'string') return fallback;
  const trimmed = redirectTo.trim();
  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//')) return fallback;
  if (trimmed.startsWith('/login')) return fallback;
  return trimmed;
};

const getEligibleDeliveredItem = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    products: {
      $elemMatch: {
        productId: productId,
        status: 'Delivered'
      }
    }
  }).sort({ orderDate: -1 });

  if (!order) return null;

  const deliveredItem = order.products.find(
    (item) =>
      item.productId?.toString() === productId.toString() &&
      item.status === 'Delivered'
  );

  if (!deliveredItem) return null;

  return { order, deliveredItem };
};

const syncProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) {
    await Product.findByIdAndUpdate(productId, { averageRating: 0, ratingCount: 0 });
    return;
  }

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(stats[0].averageRating.toFixed(1)),
    ratingCount: stats[0].ratingCount
  });
};

const upsertReview = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productId } = req.params;
    const { title, comment } = req.body;
    const rating = Number(req.body.rating);
    const redirectTo = getSafeRedirectPath(req.body.redirectTo, `/product/${productId}`);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.redirect(`${redirectTo}?reviewStatus=invalid`);
    }

    if (!Number.isFinite(rating) || rating < 0.5 || rating > 5 || Math.round(rating * 2) !== rating * 2) {
      return res.redirect(`${redirectTo}?reviewStatus=invalid`);
    }

    const eligible = await getEligibleDeliveredItem(userId, productId);
    if (!eligible) {
      return res.redirect(`${redirectTo}?reviewStatus=notEligible`);
    }

    const existingReview = await Review.findOne({ user: userId, product: productId });
    const payload = {
      rating,
      title: (title || '').trim(),
      comment: (comment || '').trim(),
      order: eligible.order._id,
      orderItemId: eligible.deliveredItem._id
    };

    let reviewStatus = 'added';
    if (existingReview) {
      existingReview.rating = payload.rating;
      existingReview.title = payload.title;
      existingReview.comment = payload.comment;
      existingReview.order = payload.order;
      existingReview.orderItemId = payload.orderItemId;
      await existingReview.save();
      reviewStatus = 'updated';
    } else {
      await Review.create({
        user: userId,
        product: productId,
        ...payload
      });
    }

    await syncProductRatingStats(productId);
    return res.redirect(`${redirectTo}?reviewStatus=${reviewStatus}`);
  } catch (error) {
    console.error('Error while saving review:', error);
    const fallback = getSafeRedirectPath(req.body.redirectTo, '/shop');
    return res.redirect(`${fallback}?reviewStatus=error`);
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productId } = req.params;
    const redirectTo = getSafeRedirectPath(req.body.redirectTo, `/product/${productId}#reviews`);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.redirect(`${redirectTo}?reviewStatus=invalid`);
    }

    const deleted = await Review.findOneAndDelete({
      user: userId,
      product: productId
    });

    if (!deleted) {
      return res.redirect(`${redirectTo}?reviewStatus=invalid`);
    }

    await syncProductRatingStats(productId);
    return res.redirect(`${redirectTo}?reviewStatus=deleted`);
  } catch (error) {
    console.error('Error while deleting review:', error);
    const fallback = getSafeRedirectPath(req.body.redirectTo, '/shop');
    return res.redirect(`${fallback}?reviewStatus=error`);
  }
};

module.exports = {
  upsertReview,
  deleteReview,
  getEligibleDeliveredItem
};
