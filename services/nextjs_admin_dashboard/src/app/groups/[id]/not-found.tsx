import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="">
      <h2>Not Found</h2>
      <p className="">Could not find requested group</p>
      <Link href="/groups" className="underline">
        Return to groups
      </Link>
    </div>
  );
}
