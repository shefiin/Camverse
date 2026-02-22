const isOfferActive = (offer, now = new Date()) => {
  if (!offer || !offer.isActive) return false;
  if (!offer.discountValue || Number(offer.discountValue) <= 0) return false;

  const startsAt = offer.startDate ? new Date(offer.startDate) : null;
  const endsAt = offer.endDate ? new Date(offer.endDate) : null;

  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
};

const getEffectiveUnitPrice = (product, now = new Date()) => {
  if (!product) return 0;

  const productOffer = isOfferActive(product.individualOffer, now)
    ? product.individualOffer
    : null;
  const categoryOffer =
    product.category && isOfferActive(product.category.individualOffer, now)
      ? product.category.individualOffer
      : null;

  const activeOffer = productOffer || categoryOffer;
  const basePrice = Number(product.price || 0);

  if (!activeOffer) return basePrice;

  let offerDiscount = 0;
  if (activeOffer.discountType === "FLAT") {
    offerDiscount = Number(activeOffer.discountValue) || 0;
  } else {
    offerDiscount = (basePrice * (Number(activeOffer.discountValue) || 0)) / 100;
  }

  return Math.max(0, Math.round(basePrice - offerDiscount));
};

module.exports = {
  getEffectiveUnitPrice
};
