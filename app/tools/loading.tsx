export default function ToolLoading() {
  return (
    <div className="pb-24" aria-busy="true" aria-label="Loading tool">
      {/* breadcrumb skeleton */}
      <div className="mx-auto max-w-3xl px-6 pt-6">
        <div className="flex items-center gap-1.5">
          <div className="skeleton h-3 w-10" />
          <div className="skeleton h-3 w-3 rounded-full" />
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-3 rounded-full" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>

      {/* tool header skeleton */}
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <div className="skeleton h-4 w-20 mb-5" />
        <div className="flex items-center gap-3">
          <div className="skeleton h-11 w-11 shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-6 w-48 mb-2" />
            <div className="skeleton h-3.5 w-72 max-w-full" />
          </div>
        </div>
      </div>

      {/* main content card skeleton */}
      <div className="mx-auto max-w-2xl px-6 mt-8">
        <div className="rounded-lg border-2 border-dashed border-paper-line px-6 py-14 text-center">
          <div className="skeleton mx-auto h-12 w-12 rounded-full" />
          <div className="skeleton mx-auto mt-4 h-4 w-56" />
          <div className="skeleton mx-auto mt-2 h-3 w-40" />
          <div className="skeleton mx-auto mt-5 h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* related tools skeleton */}
      <div className="mx-auto max-w-3xl px-6 py-6">
        <div className="skeleton h-4 w-40 mb-3" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border border-paper-line px-4 py-3">
              <div className="skeleton h-8 w-8 shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-3.5 w-24 mb-1.5" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* faq skeleton */}
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="skeleton h-4 w-64 mb-3" />
        <div className="divide-y divide-paper-line border-t border-b border-paper-line">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="py-3.5">
              <div className="skeleton h-3.5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
