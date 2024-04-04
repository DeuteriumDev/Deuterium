import _ from 'lodash';
import Link from 'next/link';

export default function formatCellContent(
  content: unknown,
): string | React.ReactNode {
  if (_.isDate(content)) {
    return content.toISOString();
  } else if (_.isBoolean(content)) {
    return content ? 'true' : 'false';
  } else if (_.isString(content) && /\[.*\](.*)/.test(content)) {
    const matches = /\[(.+)\]\((.+)\)/.exec(content);
    if (_.isNull(matches)) {
      throw new Error(`formatCellContent - href match error: ${matches}`);
    }
    const href = matches[2] || '?';
    const text = matches[1] || '';
    return (
      <Link href={href} className="underline">
        {text}
      </Link>
    );
  } else if (_.isString(content) || _.isNil(content)) {
    return content;
  }

  throw new Error(`formatCellContent - type error : ${content}`);
}
