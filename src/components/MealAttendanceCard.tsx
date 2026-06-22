"use client";

import { useEffect, useState } from "react";
import { Lock, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";

export interface MealComponentProps {
  creator_id: string;
  creation_timestamp: string;
  is_locked: boolean;
  meal_type: "Lunch" | "Dinner";
  current_attendance_status: boolean;
  onAttendanceChange?: (status: boolean) => void;
}

const LOCKOUT_WINDOW_HOURS = 12;
const TICK_INTERVAL_MS = 60_000;

/**
 * Phase 3, Task 3.1: ABAC time-bound rule engine. MEMBER edits are only
 * allowed within a 12h window of ledger creation; `now` ticks on an interval
 * so the lockout engages live without requiring a page refresh.
 */
export default function MealAttendanceCard({
  creator_id,
  creation_timestamp,
  is_locked,
  meal_type,
  current_attendance_status,
  onAttendanceChange,
}: MealComponentProps) {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<boolean>(current_attendance_status);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const elapsedHours = (now - Date.parse(creation_timestamp)) / (1000 * 60 * 60);
  const isLockedForMember = user?.role === "MEMBER" && (elapsedHours > LOCKOUT_WINDOW_HOURS || is_locked);

  function handleToggle(): void {
    if (isLockedForMember) {
      return;
    }

    const nextStatus = !attendance;
    setAttendance(nextStatus);
    onAttendanceChange?.(nextStatus);
  }

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 shadow-sm transition-colors ${
        isLockedForMember
          ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-60"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <UtensilsCrossed className="h-5 w-5" strokeWidth={2} />
        </span>

        <div>
          <p className="text-sm font-medium text-slate-800">{meal_type} Attendance</p>
          <p className="text-xs text-slate-500">Logged by {creator_id}</p>

          {isLockedForMember && (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Lock className="h-3 w-3" strokeWidth={2} />
              Lockout window exceeded (12h limit).
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={attendance}
        aria-label={`${meal_type} attendance toggle`}
        disabled={isLockedForMember}
        onClick={handleToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isLockedForMember ? "cursor-not-allowed bg-gray-300" : attendance ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            attendance ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
