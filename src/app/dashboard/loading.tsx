export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[#1e1e2e]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[520px] animate-pulse rounded-xl bg-[#111118]" />
        <div className="h-[520px] animate-pulse rounded-xl bg-[#111118]" />
      </div>
    </div>
  );
}
