"use client";

// Screen 1 /review/[restaurantId]
// Three controls only: star picker, comment box, submit.
// The frontend's job: package 3 values and send them. The backend decides
// everything else — and on a 400 we show the BACKEND'S message verbatim.
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const ratingWord: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

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
        if (r.status === 404) {
          setName("(not found)");
          return;
        }
        const body = await r.json();
        setName(body.name);
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
      setError(body && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${r.status}.`);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[560px] px-6 py-14">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
        Writing a review for
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
        {name ?? "…"}
      </h1>

      <form onSubmit={onSubmit} className="mt-10">
        <fieldset>
          <legend className="text-sm font-medium text-stone-700">Rate it</legend>
          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
                className={`h-10 w-10 rounded-lg text-lg ${
                  rating === n
                    ? "bg-amber-500/90 text-white"
                    : rating >= n
                      ? "bg-stone-400 text-white"
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                }`}
              >
                {rating >= n ? "★" : "☆"}
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-stone-500">
                {rating} / 5 · {ratingWord[rating]}
              </span>
            )}
          </div>
        </fieldset>

        <label
          htmlFor="comment"
          className="mt-8 block text-sm font-medium text-stone-700"
        >
          Your review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="One honest line is enough."
          className="mt-3 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none focus:border-stone-400"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 w-full rounded-full bg-stone-900 py-3.5 text-sm font-medium text-stone-50 hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>

        <p className="mt-4 text-center text-xs text-stone-400">
          Your review is public and cannot be edited or deleted.
        </p>
      </form>
    </main>
  );
}
