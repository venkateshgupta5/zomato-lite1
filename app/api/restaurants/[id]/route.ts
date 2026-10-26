// GET /api/restaurants/[id]
// The kitchen. Computes three ANSWERS from stored FACTS:
//   averageRating = ROUND(AVG(rating), 1)
//   totalReviews  = COUNT(*)
//   latestReview  = newest by created_at (shown separately on the screen)
//   reviews       = every review EXCEPT the latest, newest first (no duplicates on screen)
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(_request, { params }) {
  const { id } = await params;
  const restaurantId = Number(id);

  // Malformed id (e.g. /api/restaurants/abc) is not a valid restaurant either.
  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const restaurants = await sql.query(
    "SELECT name, cuisine, area FROM restaurants WHERE id = $1",
    [restaurantId]
  );
  if (restaurants.length === 0) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }
  const restaurant = restaurants[0];

  const aggregates = await sql.query(
    `SELECT
       ROUND(AVG(rating)::numeric, 1) AS average_rating,
       COUNT(*)::int                  AS total_reviews
     FROM reviews
     WHERE restaurant_id = $1`,
    [restaurantId]
  );
  const totalReviews = aggregates[0].total_reviews;
  const averageRating =
    aggregates[0].average_rating === null
      ? null
      : Number(aggregates[0].average_rating);

  // Facts in, newest first. The latest stays out of reviews so the
  // highlighted "latest review" block isn't printed twice.
  const allReviews = await sql.query(
    `SELECT id, rating, comment, created_at
     FROM reviews
     WHERE restaurant_id = $1
     ORDER BY created_at DESC`,
    [restaurantId]
  );

  const toReview = (r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  });

  return Response.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews,
    latestReview: allReviews.length > 0 ? toReview(allReviews[0]) : null,
    reviews: allReviews.slice(1).map(toReview),
  });
}
