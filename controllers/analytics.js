const Listing = require('../models/listing');

const PRICE_BUCKETS = [
  { label: 'Budget (< $1k)', min: 0, max: 999 },
  { label: 'Value ($1k-$1.9k)', min: 1000, max: 1999 },
  { label: 'Comfort ($2k-$2.9k)', min: 2000, max: 2999 },
  { label: 'Premium ($3k-$4.9k)', min: 3000, max: 4999 },
  { label: 'Luxury ($5k+)', min: 5000, max: Infinity },
];

module.exports.dashboard = async (req, res) => {
  const listings = await Listing.find({})
    .populate({ path: 'reviews', select: 'rating createdAt' })
    .populate({ path: 'owner', select: 'username' });

  const analyticsData = buildAnalyticsPayload(listings);

  res.render('listings/analytics', { analyticsData });
};

function buildAnalyticsPayload(listings) {
  if (!Array.isArray(listings) || !listings.length) {
    return {
      summary: {
        totalListings: 0,
        averagePrice: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalReviews: 0,
        averageRating: null,
      },
      priceBuckets: PRICE_BUCKETS.map((bucket) => ({ ...bucket, count: 0 })),
      topMarkets: [],
      topPremiumListings: [],
      ratingLeaders: [],
    };
  }

  const priceValues = [];
  let totalReviewCount = 0;
  let totalRatingSum = 0;

  const bucketResults = PRICE_BUCKETS.map((bucket) => ({ ...bucket, count: 0 }));
  const countryMap = new Map();

  listings.forEach((listing) => {
    const price = Number(listing.price);
    if (Number.isFinite(price)) {
      priceValues.push(price);
      bucketResults.forEach((bucket) => {
        if (price >= bucket.min && price <= bucket.max) {
          bucket.count += 1;
        }
      });
    }

    const reviews = Array.isArray(listing.reviews) ? listing.reviews : [];
    reviews.forEach((review) => {
      if (Number.isFinite(review.rating)) {
        totalReviewCount += 1;
        totalRatingSum += review.rating;
      }
    });

    const country = (listing.country || 'Unspecified').trim() || 'Unspecified';
    if (!countryMap.has(country)) {
      countryMap.set(country, {
        country,
        listingCount: 0,
        totalPrice: 0,
        totalReviews: 0,
        ratingSum: 0,
        ratingCount: 0,
      });
    }
    const marketStat = countryMap.get(country);
    marketStat.listingCount += 1;
    if (Number.isFinite(price)) {
      marketStat.totalPrice += price;
    }
    reviews.forEach((review) => {
      if (Number.isFinite(review.rating)) {
        marketStat.totalReviews += 1;
        marketStat.ratingSum += review.rating;
        marketStat.ratingCount += 1;
      }
    });

  });

  priceValues.sort((a, b) => a - b);

  const totalListings = listings.length;
  const averagePrice = priceValues.length
    ? priceValues.reduce((sum, value) => sum + value, 0) / priceValues.length
    : 0;
  const minPrice = priceValues.length ? priceValues[0] : 0;
  const maxPrice = priceValues.length ? priceValues[priceValues.length - 1] : 0;
  const medianPrice = priceValues.length
    ? priceValues.length % 2 === 0
      ? (priceValues[priceValues.length / 2 - 1] +
          priceValues[priceValues.length / 2]) /
        2
      : priceValues[Math.floor(priceValues.length / 2)]
    : 0;

  const averageRating = totalReviewCount
    ? totalRatingSum / totalReviewCount
    : null;

  const topPremiumListings = listings
    .filter((listing) => Number.isFinite(listing.price))
    .sort((a, b) => b.price - a.price)
    .slice(0, 6)
    .map((listing) => ({
      id: String(listing._id),
      title: listing.title,
      location: listing.location,
      country: listing.country,
      price: listing.price,
    }));

  const topMarkets = Array.from(countryMap.values())
    .map((market) => ({
      country: market.country,
      listingCount: market.listingCount,
      avgPrice: market.listingCount
        ? market.totalPrice / market.listingCount
        : 0,
      totalReviews: market.totalReviews,
      avgRating: market.ratingCount
        ? market.ratingSum / market.ratingCount
        : null,
    }))
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, 8);

  const ratingLeaders = Array.from(countryMap.values())
    .filter((market) => market.ratingCount >= 3)
    .map((market) => ({
      country: market.country,
      avgRating: market.ratingSum / market.ratingCount,
      reviewCount: market.totalReviews,
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  return {
    summary: {
      totalListings,
      averagePrice,
      medianPrice,
      minPrice,
      maxPrice,
      totalReviews: totalReviewCount,
      averageRating,
    },
    priceBuckets: bucketResults.map((bucket) => ({
      label: bucket.label,
      count: bucket.count,
    })),
    topMarkets,
    topPremiumListings,
    ratingLeaders,
  };
}
