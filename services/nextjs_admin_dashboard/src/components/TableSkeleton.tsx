import Skeleton from '~/components/Skeleton';

export default function TableSkeleton() {
  return (
    <div className="pt-10">
      <div className="flex flex-col">
        <div className="grid grid-cols-1 gap-4">
          {Array(7)
            .fill(null)
            .map((_v, i) => (
              <Skeleton className="w-full h-10" key={`table-skeleton-${i}`} />
            ))}
        </div>
      </div>
    </div>
  );
}
