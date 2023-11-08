#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then
    set -o xtrace
fi

if [[ "${1-}" =~ ^-*h(elp)?$ ]]; then
    echo 'Usage: ./compile_sql.sh <sql_file> <data_file>

Template [sql_file] w/ [jinja](), and format w/ [sql-formatter]() given [data_file]

'
    exit
fi


if [[ $# -gt 2 ]]; then
    echo 'Too many arguments' >&2
    exit 2
fi

if [[ $# -lt 2 ]]; then
    echo 'Too few arguments' >&2
    exit 2
fi

# run command relative to called directory, not script directory
# cd "$(dirname "$1")"

main() {
    j2 $1 $2 | npx sql-formatter --config ./.sqlformaterrc
}

main "$@"
