/**
 * Minimal stand-in for a Supabase PostgREST query builder.
 *
 * Every chained call (select, eq, update, insert, order, in, ...) is recorded
 * and returns the same builder, so tests can assert on the exact filters a
 * route applied — in particular the `.eq('user_id', user.id)` ownership
 * filter. Awaiting the builder, or calling single()/maybeSingle(), resolves
 * to `result`.
 */
export type Call = [method: string, ...args: unknown[]];

export interface QueryResult {
  data: unknown;
  error: unknown;
}

export interface RecordingQuery extends PromiseLike<QueryResult> {
  table: string;
  calls: Call[];
  [method: string]: unknown;
}

const CHAIN_METHODS = [
  'select',
  'insert',
  'update',
  'upsert',
  'delete',
  'eq',
  'neq',
  'in',
  'is',
  'order',
  'limit',
] as const;

export function recordingQuery(table: string, result: QueryResult): RecordingQuery {
  const calls: Call[] = [];
  const query: RecordingQuery = {
    table,
    calls,
    then(onFulfilled, onRejected) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };
  for (const method of CHAIN_METHODS) {
    query[method] = (...args: unknown[]) => {
      calls.push([method, ...args]);
      return query;
    };
  }
  query.single = async () => {
    calls.push(['single']);
    return result;
  };
  query.maybeSingle = async () => {
    calls.push(['maybeSingle']);
    return result;
  };
  return query;
}

/** The `.eq(column, value)` filters applied to a recorded query. */
export function eqFilters(query: RecordingQuery): Array<[unknown, unknown]> {
  return query.calls.filter((c) => c[0] === 'eq').map((c) => [c[1], c[2]]);
}

/** Arguments of the first call to `method`, or undefined. */
export function argsOf(query: RecordingQuery, method: string): unknown[] | undefined {
  const call = query.calls.find((c) => c[0] === method);
  return call?.slice(1);
}
