// Applies db/schema.sql, then seeds Ludhiana Burrito + 3 reviews.
// Facts only: the three seeded reviews are facts (who rated what, when).
// There is NO average_rating and NO latest_review column anywhere. Never.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const text = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
  for (const statement of text.split(";").map((s) => s.trim()).filter(Boolean)) {
    await sql.query(statement);
  }
  console.log("Schema applied (two IF NOT EXISTS tables).");

  const existing = await sql.query(
    "SELECT id FROM restaurants WHERE name = 'Ludhiana Burrito' LIMIT 1"
  );
  let restaurantId;
  if (existing.length > 0) {
    restaurantId = existing[0].id;
    console.log(`Restaurant already exists (id ${restaurantId}) - not duplicating.`);
  } else {
    const created = await sql.query(
      "INSERT INTO restaurants (name, cuisine, area) VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32') RETURNING id"
    );
    restaurantId = created[0].id;
    console.log(`Created restaurant (id ${restaurantId}).`);
  }

  const seeded = await sql.query(
    "SELECT count(*)::int AS n, min(created_at)::text AS first FROM reviews WHERE restaurant_id = $1",
    [restaurantId]
  );
  const n = seeded[0].n;
  if (n === 0) {
    // created_at a few days apart so "latest" is meaningful.
    await sql.query(
      `INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES
        ($1, 5, 'Paneer burrito is unreal',  NOW() - INTERVAL '8 days'),
        ($1, 4, 'Good, but slow service',    NOW() - INTERVAL '6 days'),
        ($1, 4, 'Solid. Would repeat.',      NOW() - INTERVAL '2 days')`,
      [restaurantId]
    );
    console.log("Seeded 3 reviews (8, 6 and 2 days ago).");
  } else {
    console.log(`Skipped seeding - ${n} reviews already exist since ${seeded[0].first}.`);
  }

  const restaurant = await sql.query("SELECT * FROM restaurants");
  const reviews = await sql.query(
    "SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY id"
  );
  console.log("\nrestaurants rows:", restaurant);
  console.log("\nreviews rows:", reviews);
}

main().catch((err) => {
  console.error("db setup failed:", err.message);
  process.exit(1);
});

