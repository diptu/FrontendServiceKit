export default function AdminFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row">
      <span>© 2026 NutraTenant. All rights reserved.</span>
      <div className="flex gap-4">
        {["Support", "Status", "Privacy", "Terms"].map((l) => (
          <a key={l} href="#" className="hover:text-slate-600">
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}
