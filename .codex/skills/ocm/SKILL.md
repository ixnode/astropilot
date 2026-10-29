---
name: ocm
description: Use when the user wants an English one-line commit message for the current uncommitted repository changes, including when they type only `ocm` or explicitly invoke `$ocm`.
---

# OCM

## Overview

This skill returns a single one-line commit message for the current uncommitted changes in the active repository.

## Trigger

Use this skill when the user:

- writes only `ocm`
- asks for a one-line commit message
- explicitly invokes `$ocm`

## Workflow

1. Inspect the current uncommitted repository changes.
2. Infer the most accurate concise commit summary.
3. Return only the commit message.

## Output Rules

- Output exactly one line.
- Do not add explanation, bullets, code fences, or surrounding text.
- Do not include a trailing justification.
- Write the commit message in English, regardless of the conversation language.
- Use Conventional Commits: `<type>(<optional scope>): <concise imperative summary>`.
- Use a fitting lowercase type such as `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, or `style`.

## Validation

- Base the message on the actual current git diff or status, not assumptions.
