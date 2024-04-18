import _ from 'lodash';

/**
 * Cast provided value to correct type for query
 *
 * @param value - whatever query value
 * @param key - optional key to use as name-string for query, usually param "$index"
 * @returns
 */
function castValueToSQL(value: unknown, key?: string): string | null {
  if (_.isNil(value)) {
    return key ? (key as string) : (value as null);
  }

  if (
    _.isString(value) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    if (key) {
      return `${key}::uuid`;
    }
    return `${value}::uuid`;
  }

  if (key) {
    return key;
  }
  return _.toString(value);
}

export default castValueToSQL;
