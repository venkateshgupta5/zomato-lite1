// POST /api/reviews
// Accepts:  { "restaurantId": 1, "rating": 4, "comment": "Good, but slow service" }
// Returns:  201 { "success": true, "reviewId": 104 }
// Validates in this exact order, first failure wins (plain-English reason, HTTP 400):
//   1. rating is a whole number from 1 to 5
//   2. comment is a non-empty string after trimming whitespace
//   3. restaurantId refers to a restaurant that actually exists (database lookup)
// Then inserts exactly ONE row. Nothing is computed or stored besides the fact itself.
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const { restaurantId, rating, comment } = body ?? {};

  // Check 1: rating is a whole number from 1 to 5 (the frontend's star picker
  // is not trusted here - anyone can talk to this API without the UI).
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return Response.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 }
    );
  }

  // Check 2: comment is a non-empty string after trimming whitespace.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return Response.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  // Check 3: restaurantId refers to a restaurant that actually exists.
  if (
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId) ||
    restaurantId < 1
  ) {
    return Response.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }
  const found = await sql.query(
    "SELECT id FROM restaurants WHERE id = $1",
    [restaurantId]
  );
  if (found.length === 0) {
    return Response.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }

  // Success: store the FACT. One row. No scores updated, no averages touched.
  const inserted = await sql.query(
    `INSERT INTO reviews (restaurant_id, rating, comment)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [restaurantId, rating, comment.trim()]
  );

  return Response.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}
