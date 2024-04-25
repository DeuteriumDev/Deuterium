'use client';

import { DependencyList, useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import { QueryResultRow } from 'pg';
import buildQuery from './buildQuery';

interface UseQueryOptions {
  dependencies?: DependencyList;
  initialize?: boolean;
  debounce?: number;
  debug?: boolean;
}

export type Result<T extends QueryResultRow> = ReturnType<typeof buildQuery<T>>;
export type ExecuteFunc<T extends QueryResultRow> =
  | ((...args: unknown[]) => Result<T>)
  | _.DebouncedFunc<(...args: unknown[]) => Result<T>>;

/**
 * Turn async server actions into react hooks for use in client-side components.
 *
 * @param query - query to call via returned [execute] method, or via [dependencies] changes from [React.useEffect] calls
 * @param options - options object specifying the behavior of the hook
 * @returns
 */
export default function useQuery<T extends QueryResultRow>(
  query: (...args: unknown[]) => Result<T>,
  options?: UseQueryOptions,
): {
  loading: boolean;
  data: {
    rows: T[];
    rowCount: number;
  } | null;
  execute: ExecuteFunc<T>;
  errorMessage: string | null;
} {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    rows: T[];
    rowCount: number;
  } | null>(null);
  const [errorMessage, setError] = useState<string | null>(null);

  const execute: ExecuteFunc<T> = async (...args) => {
    console.log({ args });
    setError(null);
    setLoading(true);
    try {
      const queryResult = await query(...args);
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
      return queryResult;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
      setLoading(false);
      return {
        data: null,
        errorMessage: e instanceof Error ? e.message : 'Unknown Error',
      };
    }
  };
  const {
    current: { debouncedExecute },
  } = useRef({
    debouncedExecute: _.debounce(
      (...args) => execute(...args),
      options?.debounce,
    ),
  });
  // const debouncedExecute = _.debounce(execute, options?.debounce);

  useEffect(() => {
    if (options?.initialize) {
      if (options?.debounce) {
        debouncedExecute();
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
    execute: options?.debounce ? debouncedExecute : execute,
    errorMessage,
  };
}
