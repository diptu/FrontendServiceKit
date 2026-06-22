"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";

interface ExpenseFormState {
  item_description: string;
  amount: string;
  expense_date: string;
}

interface ExpenseFormErrors {
  item_description?: string;
  amount?: string;
  expense_date?: string;
}

const DEFICIT_LIMIT = -500.0;

function formatTaka(amount: number): string {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function validateExpenseForm(state: ExpenseFormState): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  if (state.item_description.trim().length === 0) {
    errors.item_description = "Item description is required.";
  }

  const parsedAmount = Number(state.amount);
  if (state.amount.trim().length === 0 || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = "Enter a valid positive amount.";
  }

  if (state.expense_date.trim().length === 0) {
    errors.expense_date = "Expense date is required.";
  }

  return errors;
}

/**
 * Phase 3, Task 3.2: hard-blocks bazaar expense submission once a MEMBER's
 * current_balance breaches the -৳500.00 deficit floor from AuthContext.
 */
export default function ExpenseForm() {
  const { user, current_balance } = useAuth();

  const [formState, setFormState] = useState<ExpenseFormState>({
    item_description: "",
    amount: "",
    expense_date: "",
  });
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isHardLocked = user?.role === "MEMBER" && current_balance < DEFICIT_LIMIT;

  function updateField<K extends keyof ExpenseFormState>(field: K, value: ExpenseFormState[K]): void {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function interceptLockedKeydown(event: KeyboardEvent<HTMLFormElement>): void {
    if (isHardLocked && event.key === "Enter") {
      event.preventDefault();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isHardLocked) {
      return;
    }

    const validationErrors = validateExpenseForm(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      setFormState({ item_description: "", amount: "", expense_date: "" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800">Bazaar Expense Entry</h2>
      <p className="mt-1 text-sm text-slate-500">
        Log a new mess bazaar expense against the shared tenant ledger.
      </p>

      <div className="relative mt-5">
        <form
          onSubmit={handleSubmit}
          onKeyDown={interceptLockedKeydown}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="item_description" className="text-sm font-medium text-slate-700">
              Item Description
            </label>
            <input
              id="item_description"
              type="text"
              disabled={isHardLocked}
              value={formState.item_description}
              onChange={(event) => updateField("item_description", event.target.value)}
              placeholder="Rice, lentils, vegetables..."
              className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                errors.item_description ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.item_description && (
              <span className="text-xs font-medium text-red-600">{errors.item_description}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-medium text-slate-700">
              Amount (৳)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              disabled={isHardLocked}
              value={formState.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="0.00"
              className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                errors.amount ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.amount && <span className="text-xs font-medium text-red-600">{errors.amount}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expense_date" className="text-sm font-medium text-slate-700">
              Expense Date
            </label>
            <input
              id="expense_date"
              type="date"
              disabled={isHardLocked}
              value={formState.expense_date}
              onChange={(event) => updateField("expense_date", event.target.value)}
              className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                errors.expense_date ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.expense_date && (
              <span className="text-xs font-medium text-red-600">{errors.expense_date}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isHardLocked || isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging Expense..." : "Log Expense"}
          </button>
        </form>

        {isHardLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 p-2 backdrop-blur-[2px]">
            <div className="w-full rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-md">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-5 w-5" strokeWidth={2} />
                <h3 className="text-sm font-bold">Form Action Suspended</h3>
              </div>
              <p className="mt-2 text-sm">
                Your current balance (৳{formatTaka(current_balance)}) is below the maximum allowed debt
                limit of -৳500.00. Please clear outstanding mess dues with management to re-enable logging
                tools.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
