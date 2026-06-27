"use client";

import {
  createContext, useCallback, useContext, useState, type ReactNode,
} from "react";

/* ── Types ──────────────────────────────────────────────────────────────── */
export type Priority  = "high" | "medium" | "low";
export type NStatus   = "unread" | "read";
export type NType     = "order" | "meal" | "user" | "finance" | "system";

export interface Notification {
  id:       string;
  type:     NType;
  title:    string;
  subtitle: string;
  module:   string;
  priority: Priority;
  date:     string;
  status:   NStatus;
}

/* ── Seed data ───────────────────────────────────────────────────────────── */
const SEED: Notification[] = [
  { id: "n1",  type: "order",   title: "New Order Received",      subtitle: "Order #ORD-0144 placed by Alice Wright for High Protein plan.",  module: "Orders",     priority: "high",   date: "Jun 26, 2026 · 10:24 AM", status: "unread" },
  { id: "n2",  type: "meal",    title: "Meal Plan Reminder",      subtitle: "Today's lunch — Grilled Chicken & Quinoa is ready for pickup.",  module: "Meal Plans", priority: "medium", date: "Jun 26, 2026 · 9:00 AM",  status: "unread" },
  { id: "n3",  type: "finance", title: "Payment Received",        subtitle: "Invoice INV-2026-006 paid in full. Amount: $1,500.00.",          module: "Finance",    priority: "high",   date: "Jun 26, 2026 · 8:45 AM",  status: "unread" },
  { id: "n4",  type: "user",    title: "New Member Registered",   subtitle: "Charlie Nguyen joined the Balanced plan. Review their profile.", module: "Members",    priority: "low",    date: "Jun 25, 2026 · 5:12 PM",  status: "read"   },
  { id: "n5",  type: "order",   title: "Order Cancelled",         subtitle: "Order #ORD-0140 cancelled by Evan Marsh. Refund issued.",        module: "Orders",     priority: "high",   date: "Jun 25, 2026 · 3:30 PM",  status: "read"   },
  { id: "n6",  type: "meal",    title: "Meal Plan Assigned",      subtitle: "Dana Osei assigned to Mediterranean plan (effective Jul 1).",    module: "Meal Plans", priority: "medium", date: "Jun 25, 2026 · 2:00 PM",  status: "read"   },
  { id: "n7",  type: "user",    title: "Member Plan Changed",     subtitle: "George Lin upgraded from Basic to High Protein plan.",           module: "Members",    priority: "medium", date: "Jun 24, 2026 · 11:15 AM", status: "read"   },
  { id: "n8",  type: "finance", title: "Invoice Generated",       subtitle: "June 2026 invoice INV-2026-006 has been generated and sent.",    module: "Finance",    priority: "medium", date: "Jun 24, 2026 · 9:00 AM",  status: "read"   },
  { id: "n9",  type: "order",   title: "Delivery Completed",      subtitle: "Order #ORD-0141 delivered to Dana Osei at 12:35 PM.",            module: "Orders",     priority: "low",    date: "Jun 24, 2026 · 12:35 PM", status: "read"   },
  { id: "n10", type: "system",  title: "Weekly Report Available", subtitle: "Your Jun 18–24 weekly operations report is ready to download.", module: "Reports",    priority: "low",    date: "Jun 24, 2026 · 8:00 AM",  status: "read"   },
  { id: "n11", type: "meal",    title: "Menu Update Published",   subtitle: "July 2026 menus are now live. 12 new items added.",              module: "Menus",      priority: "medium", date: "Jun 23, 2026 · 4:00 PM",  status: "read"   },
  { id: "n12", type: "user",    title: "New Staff Account",       subtitle: "Hana Popov added as Kitchen Staff. Access granted.",             module: "Members",    priority: "medium", date: "Jun 23, 2026 · 10:00 AM", status: "read"   },
];

/* ── Context value ────────────────────────────────────────────────────────── */
interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount:   number;
  markRead:      (id: string) => void;
  markAllRead:   () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: SEED,
  unreadCount:   SEED.filter(n => n.status === "unread").length,
  markRead:      () => {},
  markAllRead:   () => {},
});

/* ── Provider ────────────────────────────────────────────────────────────── */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(SEED);

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: "read" } : n)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, status: "read" })));
  }, []);

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────────────────── */
export function useNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext);
}
