import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="">
      <h2>Not Found</h2>
      <p className="">Could not find requested permission</p>
      <Link href="/permissions" className="underline">
        Return to permissions
      </Link>
    </div>
  );
}
