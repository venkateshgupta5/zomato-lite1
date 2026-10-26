"use client";

// Screen 2 /restaurant/[id]
// Still zero business maths: the average, count and ordering all arrive from
// the API. The only logic added is PRESENTATION — which color a given rating
// should wear. Color is decoration for the number we were handed, not a result.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteHeader } from "../../components/site-header";

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

// Presentation only: which colors this score wears.
const scoreTone: Record<number, string> = {
  1: "bg-red-50 text-brand",
  2: "bg-amber-50 text-amber-600",
  3: "bg-amber-50 text-amber-600",
  4: "bg-emerald-50 text-emerald-600",
  5: "bg-emerald-50 text-emerald-600",
};

function bigTone(average: number | null): string {
  if (average === null) return "text-stone-300";
  if (average >= 4) return "text-emerald-600";
  if (average >= 2) return "text-amber-500";
  return "text-brand";
}

// Relative time = presentation formatting, not business logic. The averages
// and ratings still live with the backend; this only says "2 days ago".
function when(iso: string): string {
  const diffDays = (Date.now() - new Date(iso).getTime()) / 86400000;
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (diffDays < 1) return fmt.format(-Math.max(1, Math.round(diffDays * 24)), "hour");
  if (diffDays < 30) return fmt.format(-Math.round(diffDays), "day");
  return fmt.format(-Math.round(diffDays / 365), "year");
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
      <>
        <SiteHeader />
        <main className="mx-auto max-w-[560px] px-6 py-16">
          <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-stone-600">
            Restaurant not found.
          </p>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-sm text-stone-500">Loading…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[calc(100dvh-56px)] max-w-[560px] px-6 pt-6 pb-24">
        <section>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              {data.name}
            </h1>
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
              Dine-in
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-500">
            {[data.cuisine, data.area].join(" · ")}
          </p>
        </section>

        {/* The average is computed by the backend (ROUND(AVG(rating), 1)).
            This file only decides which color prints it. */}
        <section className="mt-8 flex items-end gap-3">
          <span
            className={`text-7xl leading-none font-extrabold tracking-tight ${bigTone(data.averageRating)}`}
          >
            {data.averageRating ?? "—"}
          </span>
          <div className="pb-1">
            <p className="text-sm text-stone-400">{data.totalReviews} reviews</p>
            <p className="mt-1 text-xs text-stone-400">out of 5 · diners-only</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            ⭐ Latest review
          </h2>
          {data.latestReview ? (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${scoreTone[data.latestReview.rating]}`}
                >
                  {data.latestReview.rating}
                </span>
                <span className="text-sm font-semibold text-stone-800">
                  {ratingWord[data.latestReview.rating]}
                </span>
                <span
                  className="ml-auto text-xs text-stone-400"
                  title={data.latestReview.createdAt}
                >
                  {when(data.latestReview.createdAt)}
                </span>
              </div>
              <p className="mt-3 text-base text-stone-800">
                {data.latestReview.comment}
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-8 text-center">
              <p className="text-2xl" aria-hidden>
                🍴
              </p>
              <p className="mt-2 font-semibold text-stone-800">
                No reviews yet
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Your verdict could be the very first.
              </p>
            </div>
          )}
        </section>

        {data.reviews.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Earlier reviews
            </h2>
            <ul className="mt-3 space-y-3">
              {data.reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-stone-200/70 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${scoreTone[r.rating]}`}
                    >
                      {r.rating}
                    </span>
                    <span className="text-sm font-medium text-stone-700">
                      {ratingWord[r.rating]}
                    </span>
                    <span
                      className="ml-auto text-xs text-stone-400"
                      title={r.createdAt}
                    >
                      {when(r.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-800">{r.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <a
          href={`/review/${id}`}
          className="mt-12 block rounded-full bg-brand py-4 text-center text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark"
        >
          Write a review
        </a>

        <footer className="mt-12 text-center text-xs text-stone-400">
          zomato-lite · reviews stored live in Postgres
        </footer>
      </main>
    </>
  );
}
