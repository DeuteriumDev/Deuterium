import { usePathname, useSearchParams } from 'next/navigation';

export default function useUrl() {
  const search = useSearchParams();
  const path = usePathname();

  return {
    set(key: string, value: string) {
      const val = new URLSearchParams(search);
      val.set(key, value);
      return `?${val.toString()}`;
    },
    delete(key: string) {
      const val = new URLSearchParams(search);
      val.delete(key);
      return `?${val.toString()}`;
    },
    get(key: string): string | null {
      return search.get(key);
    },
    string() {
      const val = new URLSearchParams(search);
      return `?${val.toString()}`;
    },
    url() {
      const val = new URLSearchParams(search);
      if (val.toString() === '') {
        return path;
      }
      return `${path}?${val.toString()}`;
    },
  };
}
