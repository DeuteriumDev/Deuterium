import { DependencyList, useEffect, useState } from 'react';
import buildQuery from './buildQuery';
import _ from 'lodash';

interface UseQueryOptions {
  dependencies?: DependencyList;
  initialize?: boolean;
  debounce?: number;
  debug?: boolean;
}

/**
 * Turn async server actions into react hooks for use in client-side components.
 *
 * @param query - query to call via returned [execute] method, or via [dependencies] changes from [React.useEffect] calls
 * @param options - options object specifying the behavior of the hook
 * @returns
 */
export default function useQuery<T>(
  query: () => ReturnType<typeof buildQuery>,
  options?: UseQueryOptions,
): {
  loading: boolean;
  data: {
    rows: T[];
    rowCount: number;
  } | null;
  execute: () => Promise<{
    data: {
      rows: T[];
      rowCount: number;
    } | null;
    errorMessage: string | null;
  }>;
  errorMessage: string | null;
} {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    rows: T[];
    rowCount: number;
  } | null>(null);
  const [errorMessage, setError] = useState<string | null>(null);

  const execute = () => {
    setError(null);
    setLoading(true);
    return query()
      .then((queryResult) => {
        setData(
          queryResult.data as {
            rows: T[];
            rowCount: number;
          },
        );

        if (queryResult.errorMessage) {
          setError(queryResult.errorMessage);
        }
        setLoading(false);

        return {
          data:
            (queryResult.data as {
              rows: T[];
              rowCount: number;
            }) || null,
          errorMessage: queryResult.errorMessage,
        };
      })
      .catch((e) => {
        if (e instanceof Error) {
          setError(e.message);
        }
        setLoading(false);
        return {
          data: null,
          errorMessage: e.message,
        };
      });
  };

  useEffect(() => {
    if (options?.initialize) {
      if (options?.debounce) {
        _.debounce(execute, options.debounce)();
      } else {
        execute();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options?.dependencies || []);

  if (options?.debug) {
    // eslint-disable-next-line no-console
    console.log({
      loading,
      data,
      execute,
      errorMessage,
    });
  }

  return {
    loading,
    data,
    execute: execute as () => Promise<{
      data: {
        rows: T[];
        rowCount: number;
      } | null;
      errorMessage: string | null;
    }>,
    errorMessage,
  };
}
