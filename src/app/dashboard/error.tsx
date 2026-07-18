"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md space-y-4 rounded-xl border border-[#1e1e2e] bg-[#111118] p-8 text-center">
        <h2 className="text-xl font-semibold text-white">This tool hit an error</h2>
        <p className="text-sm text-slate-400">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
