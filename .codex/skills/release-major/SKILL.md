---
name: release-major
description: Use when the user wants to prepare the next major release for this repository, including when they type only `rmaj` or explicitly invoke `$release-major`.
---

# Release Major

## Overview

This skill prepares the repository major release workflow and bumps the current semantic version from `<major>.<minor>.<patch>` to `<major + 1>.0.0`. It does not publish, tag, push, or create a GitHub release unless the user explicitly requests that action.

## Trigger

Use this skill when the user:

- writes only `rmaj`
- asks to prepare the next major release
- explicitly invokes `$release-major`

## Workflow

1. Determine the current project version from the repository.
2. Summarize the commits since the current version tag or release point.
3. Update `CHANGELOG.md` with today's date and a concise professional summary of those changes.
4. Bump the version consistently, especially in:
   - `VERSION`
   - `package.json`
5. Preserve the release style already used by this repository.
6. After the changes are complete, output a GitHub release title in this exact format:
   - `<new version> - <single-line summary of the changes>`

## Output Rules

After completing the changes, respond concisely with:

- what was updated
- whether verification was run
- the GitHub release title on its own line

## Validation

- Run the most relevant verification command when feasible.
- If verification could not be run, say so briefly.
