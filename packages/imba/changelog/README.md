# Changelog entries

Each change that users of imba can see gets one file in this directory. Do not edit `../changelog.md` for a change. The release writes that file from the files here.

- Name the file `YYYY-MM-DD-short-slug.md`, with the date of the change.
- Write the entry as one or more paragraphs of markdown. Do not start it with a bullet, because the release adds one.
- Say what changed, why, and what users must do differently, as the entries in `../changelog.md` do.

Two pull requests that each add their own file do not conflict.

When lerna publishes a new version of imba, it runs the `version` script. That script calls `scripts/compile-changelog.js`, which:

1. Adds a `## <version>` section at the top of `../changelog.md`, with one bullet per file, newest first.
2. Deletes the files and stages the changes, so that they go into the release commit.
