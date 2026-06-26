"use client";

import { Bike, CheckCircle2, Clock, MapPin, Package, Phone } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/ui";

const STEPS = [
  { label: "Order Placed",      done: true,    time: "12:00 PM" },
  { label: "Meal Preparation",  done: true,    time: "12:20 PM" },
  { label: "Out for Delivery",  done: true,    time: "1:05 PM"  },
  { label: "Delivered",         done: false,   time: "ETA 1:35 PM" },
];

const HISTORY = [
  { id: "#ORD-3321", meal: "Grilled Chicken & Quinoa Salad", date: "Jun 25, 2026", status: "delivered", time: "1:28 PM" },
  { id: "#ORD-3318", meal: "Overnight Oats & Berries",       date: "Jun 25, 2026", status: "delivered", time: "8:05 AM" },
  { id: "#ORD-3309", meal: "Salmon with Steamed Vegetables", date: "Jun 24, 2026", status: "delivered", time: "7:15 PM" },
  { id: "#ORD-3302", meal: "Vegetarian Buddha Bowl",         date: "Jun 24, 2026", status: "delivered", time: "12:42 PM" },
];

export default function TrackingPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <h1 className="text-xl font-bold text-slate-900">Delivery Tracking</h1>
        <p className="mt-0.5 text-sm text-slate-500">Real-time tracking for your active and past deliveries.</p>
      </FadeIn>

      {/* Active delivery */}
      <SlideUp className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <Bike className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-indigo-900">Active Delivery</span>
            </div>
            <p className="mt-1 text-xs text-indigo-700">Grilled Chicken & Quinoa Salad · Lunch</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-indigo-900">#ORD-3325</p>
            <p className="text-[11px] text-indigo-600 mt-0.5">ETA: 1:35 PM</p>
          </div>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${step.done ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"}`}>
                  {step.done
                    ? <CheckCircle2 className="h-4 w-4 text-white" />
                    : <div className="h-2 w-2 rounded-full bg-slate-300" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 ${step.done ? "bg-indigo-400" : "bg-slate-200"} flex-1 min-h-[24px] my-0.5`} />
                )}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-semibold ${step.done ? "text-indigo-900" : "text-slate-400"}`}>{step.label}</p>
                <p className={`text-[11px] mt-0.5 ${step.done ? "text-indigo-600" : "text-slate-400"}`}>{step.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery info */}
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-xs text-indigo-700">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>28 Oak Street, Downtown</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-700">
            <Package className="h-4 w-4 shrink-0" />
            <span>Rider: Marcus T.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-700">
            <Phone className="h-4 w-4 shrink-0" />
            <span>Contact Rider</span>
          </div>
        </div>
      </SlideUp>

      {/* Delivery history */}
      <SlideUp delay={0.06} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Delivery History</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {HISTORY.map(h => (
            <div key={h.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-slate-900">{h.meal}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{h.date} · Delivered at {h.time}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-[11px] font-semibold text-indigo-600">{h.id}</span>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Delivered</span>
              </div>
            </div>
          ))}
        </div>
      </SlideUp>

      {/* Map placeholder */}
      <SlideUp delay={0.1} className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <MapPin className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-400">Live map view</p>
          <p className="text-xs text-slate-300">Available with backend integration</p>
        </div>
      </SlideUp>
    </div>
  );
}
