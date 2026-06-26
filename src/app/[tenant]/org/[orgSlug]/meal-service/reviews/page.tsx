"use client";

import { Star, ThumbsUp, Filter } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";

const RATINGS_DIST = [
  { star: 5, count: 312, pct: 62 }, { star: 4, count: 120, pct: 24 },
  { star: 3, count: 45,  pct: 9  }, { star: 2, count: 15,  pct: 3  },
  { star: 1, count: 8,   pct: 2  },
];

const REVIEWS = [
  { name: "Alice Wright",   avatar: "AW", bg: "bg-indigo-500",  rating: 5, date: "Jun 25, 2026", meal: "High Protein Bowl",    comment: "Absolutely amazing. The protein content is perfect and the taste is incredible. Will definitely re-order!" },
  { name: "Bob Keller",     avatar: "BK", bg: "bg-emerald-500", rating: 4, date: "Jun 24, 2026", meal: "Grilled Chicken Salad", comment: "Very fresh and well-portioned. Would have liked a bit more dressing but otherwise a solid 4/5 meal." },
  { name: "Charlie N.",     avatar: "CN", bg: "bg-violet-500",  rating: 5, date: "Jun 23, 2026", meal: "Vegetarian Buddha Bowl", comment: "As a vegetarian this is exactly what I needed. Loved the variety of veggies and the tahini sauce." },
  { name: "Dana Osei",      avatar: "DO", bg: "bg-amber-500",   rating: 3, date: "Jun 22, 2026", meal: "Salmon Teriyaki",       comment: "The salmon was a bit overcooked this time. Packaging was nice though and I liked the brown rice portion." },
  { name: "Fatima Reyes",   avatar: "FR", bg: "bg-rose-500",    rating: 5, date: "Jun 21, 2026", meal: "Avocado Quinoa Toast",  comment: "This is my go-to breakfast now. Light, healthy, and genuinely delicious. Highly recommend the avocado toast!" },
];

const STATS = [
  { label: "Avg Rating",     value: "4.7",  sub: "Out of 5.0",     color: "bg-amber-500"   },
  { label: "Total Reviews",  value: "500",  sub: "All reviews",     color: "bg-indigo-500"  },
  { label: "5-Star Reviews", value: "312",  sub: "62% of total",    color: "bg-emerald-500" },
  { label: "Response Rate",  value: "91%",  sub: "Replied reviews", color: "bg-violet-500"  },
];

function StarRow({ n, filled }: { n: number; filled: boolean }) {
  return <Star className={`h-4 w-4 ${filled ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />;
}

export default function ReviewsPage() {
  const avgRating = 4.7;

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reviews</h1>
          <p className="mt-0.5 text-sm text-slate-500">Customer feedback and meal ratings across all active plans.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none">
            {["All Plans", "High Protein", "Balanced", "Vegetarian"].map(o => <option key={o}>{o}</option>)}
          </select>
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" />Filter
          </button>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(s => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 h-1.5 w-10 rounded-full ${s.color}`} />
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{s.sub}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <SlideUp className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Rating summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Rating Overview</h2>
          <div className="flex flex-col items-center gap-1 mb-6">
            <p className="text-5xl font-extrabold text-slate-900">{avgRating}</p>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => <StarRow key={i} n={i} filled={i <= Math.round(avgRating)} />)}
            </div>
            <p className="text-xs text-slate-400">Based on 500 reviews</p>
          </div>
          <div className="flex flex-col gap-2">
            {RATINGS_DIST.map(r => (
              <div key={r.star} className="flex items-center gap-2.5 text-xs">
                <span className="w-4 text-right font-medium text-slate-600">{r.star}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-8 text-slate-400">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {REVIEWS.map(r => (
            <div key={r.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${r.bg} text-xs font-bold text-white`}>{r.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                    <p className="text-[11px] text-slate-400">{r.meal} · {r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">{r.comment}</p>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 transition-colors">
                  <ThumbsUp className="h-3 w-3" />Helpful
                </button>
                <button type="button" className="text-[11px] text-indigo-600 hover:underline">Reply</button>
              </div>
            </div>
          ))}
        </div>
      </SlideUp>
    </div>
  );
}
