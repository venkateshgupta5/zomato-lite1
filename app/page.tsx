export default function Home() {
  return (
    <main className="mx-auto min-h-dvh max-w-[560px] px-6 pb-20">
      <section className="pt-20 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          <span className="text-stone-900">Honest reviews.</span>{" "}
          <span className="text-brand">One burrito</span>{" "}
          <span className="text-amber-500">at a time.</span>
        </h1>
        <p className="mt-4 text-stone-500">
          Rate the neighbourhood hero in seconds. No accounts, no noise.
        </p>
      </section>

      <section className="mt-12 space-y-3">
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl">
            ⚡
          </span>
          <div>
            <p className="font-semibold text-stone-900">Rate in seconds</p>
            <p className="text-sm text-stone-500">Tap stars, type a line, done.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-xl">
            👀
          </span>
          <div>
            <p className="font-semibold text-stone-900">Real reviews only</p>
            <p className="text-sm text-stone-500">Straight from diners, no fluff.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-100 text-xl">
            🔓
          </span>
          <div>
            <p className="font-semibold text-stone-900">Zero signup</p>
            <p className="text-sm text-stone-500">No accounts. No passwords. Ever.</p>
          </div>
        </div>
      </section>

      <a
        href="/restaurant/1"
        className="mt-8 flex items-center justify-between rounded-2xl bg-brand px-6 py-5 text-white shadow-sm transition hover:bg-brand-dark"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Explore
          </p>
          <p className="mt-0.5 text-lg font-bold">Ludhiana Burrito →</p>
        </div>
        <span className="text-2xl" aria-hidden>
          🌯
        </span>
      </a>

      <footer className="mt-16 text-center text-xs text-stone-400">
        zomato-lite · built with Next.js + Neon Postgres
      </footer>
    </main>
  );
}
