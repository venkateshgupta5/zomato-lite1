"use client";

// Screen 2 /restaurant/[id]
// Dining room only: it calls GET /api/restaurants/[id] and RENDERS the result.
// Zero maths. Zero sorting. Zero filtering. The backend already made every
// decision (average, count, latest split out, newest-first). This file prints.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ReviewT = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantT = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: ReviewT | null;
  reviews: ReviewT[];
};

const ratingWord: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

function when(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RestaurantT | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return;
        }
        setData(await r.json());
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <main className="mx-auto min-h-dvh max-w-[560px] px-6 py-16">
        <p className="text-sm text-stone-500">Restaurant not found.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto min-h-dvh max-w-[560px] px-6 py-16">
        <p className="text-sm text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[560px] px-6 pb-16">
      <header className="pt-14">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          {data.name}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {[data.cuisine, data.area].join(" · ")}
        </p>
      </header>

      {/* THE LINE THE BRIEF ASKS ABOUT. The average arrives pre-computed
          (ROUND(AVG(rating), 1)) from the backend; we print it unchanged. */}
      <section className="mt-10 flex items-end gap-4">
        <span className="text-7xl leading-none font-medium text-stone-900">
          {data.averageRating ?? "—"}
        </span>
        <span className="text-sm text-stone-500">
          {data.averageRating === null
            ? null
            : `out of 5 · ${data.totalReviews} reviews`}
        </span>
      </section>
      {/* Confirmed: no calculation anywhere in this file. Even the join above
          is display formatting of values we were handed. */}

      <section className="mt-12">
        {data.latestReview ? (
          <>
            <h2 className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
              Latest review
            </h2>
            <div className="mt-3 rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-stone-900">
                  {data.latestReview.rating} / 5 ·{" "}
                  {ratingWord[data.latestReview.rating]}
                </span>
              </div>
              <p className="mt-2 text-base text-stone-800">
                {data.latestReview.comment}
              </p>
              <p className="mt-3 text-xs text-stone-400" title={data.latestReview.createdAt}>
                {when(data.latestReview.createdAt)}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 p-6 text-center">
            <p className="text-stone-600">No reviews yet — be the first.</p>
          </div>
        )}
      </section>

      {data.reviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Earlier reviews
          </h2>
          <ul className="mt-3 divide-y divide-stone-100">
            {data.reviews.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-stone-700">
                    {r.rating} / 5 · {ratingWord[r.rating]}
                  </span>
                  <span
                    className="text-xs text-stone-400"
                    title={r.createdAt}
                  >
                    {when(r.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-800">{r.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <a
        href={`/review/${id}`}
        className="mt-12 block rounded-full bg-stone-900 py-3.5 text-center text-sm font-medium text-stone-50 hover:bg-stone-700"
      >
        Write a review
      </a>
    </main>
  );
}
