<!-- @format -->

# Deuterium

Secure and solidify your postgres data from the ground up, on any framework, with ACAB primitives

## Development

### Commit Convention

We'd like to try and keep the commits clean and to the point, but there are some words we have to include for our future selves sake. Each commit should look like `<topic>(<optional_issue_number>): <message>`. The available `<topic>`s are:

- `chore` - something that doesn't impact the users like CI fixes, or dev changes (won't often have an issue number, and that's ok)
- `feat` - a new feature that will impact the user (_should_ have an issue)
- `bug` - a fix for a bug (_should_ have an issue)
- `wip` - when we're working on something on the side (_should not appear in `main` ever_)

While not all work will fall under the scope of an issue, there's no reason to not include it if we can.

In addition treat the `<message>` like a code-markdown doc. I find the [Google Dart Documentation Suggestions](https://dart.dev/effective-dart/documentation) to be a great piece of writing that doesn't beat you over the head with formats, is portable, and works for git commits. Eg:

```
bug(#123): Fix [NetworkManager._handleErrors] to handle `IOError`
```

is a great message that gives the reader lot of clues to what it's doing without making them read the diffs. The less reading, the less time it'll take to fix the problem when someone has to go back and investigate something.

This is all about balancing effort vs reward of writing commits, and reading commits. Enforcing wordy sentences and descriptions doesn't help anyone, but we still have to try for better than `chore: fix code` in the commit logs.

### Issue / Ticket convention

WIP
