const Coupon = require("../../models/coupon");

const NON_ACTIVE_STATUSES = new Set(["Cancelled", "Returned"]);

const toNumber = (value) => Number(value || 0);

const getLineItemTotal = (item) =>
  Math.max(0, toNumber(item?.price) * toNumber(item?.quantity));

const sameId = (a, b) => String(a) === String(b);

const resolveCouponMinPurchase = async (order) => {
  const savedMinPurchase = toNumber(order?.couponMinPurchase);
  if (savedMinPurchase > 0) return savedMinPurchase;

  if (!order?.couponCode) return 0;

  const coupon = await Coupon.findOne({ name: order.couponCode })
    .select("minPurchase")
    .lean();

  return toNumber(coupon?.minPurchase);
};

const getRemainingSubtotalAfterItemRefund = (order, orderItemId) => {
  return order.products.reduce((sum, item) => {
    if (NON_ACTIVE_STATUSES.has(item.status)) return sum;
    if (sameId(item._id, orderItemId)) return sum;
    return sum + getLineItemTotal(item);
  }, 0);
};

const calculateRefundForItem = async (order, orderItem) => {
  const baseRefund = getLineItemTotal(orderItem);
  const couponDiscount = toNumber(order?.couponDiscount);
  const couponAlreadyRecovered = toNumber(order?.couponRefundDeducted);
  let couponDeduction = 0;

  if (baseRefund <= 0 || couponDiscount <= 0) {
    return {
      baseRefund,
      couponDeduction: 0,
      refundableAmount: baseRefund
    };
  }

  const minPurchase = await resolveCouponMinPurchase(order);
  if (minPurchase <= 0) {
    return {
      baseRefund,
      couponDeduction: 0,
      refundableAmount: baseRefund
    };
  }

  const remainingSubtotalAfter = getRemainingSubtotalAfterItemRefund(
    order,
    orderItem._id
  );

  if (remainingSubtotalAfter < minPurchase) {
    const couponOutstanding = Math.max(0, couponDiscount - couponAlreadyRecovered);
    couponDeduction = Math.min(couponOutstanding, baseRefund);
  }

  return {
    baseRefund,
    couponDeduction,
    refundableAmount: Math.max(0, baseRefund - couponDeduction)
  };
};

module.exports = {
  calculateRefundForItem
};
