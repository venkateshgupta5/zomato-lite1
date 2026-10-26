"use client";

// Screen 1 /review/[restaurantId]
// Three controls, now wearing the palette: stars turn amber, submit turns
// brand-red, and the backend's error message still shows verbatim.
// New presentation nicety: a live 0/500 counter (the length cap the backend
// would enforce is unchanged — this counter is kindness, the API is the law).
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SiteHeader } from "../../components/site-header";

const ratingWord: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

const COMMENT_LIMIT = 500;

export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        setName(body && typeof body.name === "string" ? body.name : "(not found)");
      })
      .catch(() => setName("(not found)"));
  }, [restaurantId]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });
      if (r.status === 201) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }
      const body = await r.json().catch(() => null);
      setError(
        body && typeof body.error === "string"
          ? body.error
          : `Request failed with status ${r.status}.`
      );
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[calc(100dvh-56px)] max-w-[560px] px-6 pt-6 pb-20">
        <section className="rounded-2xl border border-stone-200/70 bg-white p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            Writing a review for
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-stone-900">
            {name ?? "…"}
          </h1>

          <form onSubmit={onSubmit} className="mt-8">
            <fieldset>
              <legend className="text-sm font-semibold text-stone-700">
                Rate it
              </legend>
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    aria-pressed={rating === n}
                    onClick={() => setRating(n)}
                    className={`h-12 w-12 rounded-xl text-2xl transition ${
                      rating === n
                        ? "bg-amber-400 text-white shadow-sm"
                        : rating >= n
                          ? "bg-amber-100 text-amber-500"
                          : "bg-stone-100 text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    {rating >= n ? "★" : "☆"}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-3 flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
                    {rating} / 5
                  </span>
                  <span className="text-stone-500">{ratingWord[rating]}</span>
                </p>
              )}
            </fieldset>

            <label
              htmlFor="comment"
              className="mt-8 block text-sm font-semibold text-stone-700"
            >
              Your review
            </label>
            <textarea
              id="comment"
              value={comment}
              maxLength={COMMENT_LIMIT}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="One honest line is enough."
              className="mt-3 w-full rounded-xl border border-stone-200 bg-cream px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
            <p className="mt-1 text-right text-xs text-stone-400">
              {comment.length}/{COMMENT_LIMIT}
            </p>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-brand"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-6 w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>

            <p className="mt-4 text-center text-xs text-stone-400">
              Your review is public and cannot be edited or deleted. 🔒
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
