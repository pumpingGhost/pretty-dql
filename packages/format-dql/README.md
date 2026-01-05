# @pretty-dql/format-dql

A simple and efficient DQL (Dynatrace Query Language) formatter.
This package contains the core formatting logic.

## Features

- Formats DQL queries with proper indentation and line breaks.
- Handles quoted strings correctly.
- Enforces spacing rules for brackets `[]`, `{}` and colons `:`.
- Splits commands starting with `|` into new lines.
- Aligns arguments for better readability.
- Aligns closing curly brackets with the beginning of the word preceding the opening bracket for multiline blocks.
- Keeps top-level root commands (like `fetch`) single-line if possible.
- Ensures commas are followed by a space if not followed by a newline.
- Formats multiple arguments inside brackets `[]` and `{}` on new lines with indentation.
- Formats subqueries inside brackets `[]` recursively according to the block depth.
- Preserves template string variables `${...}` without formatting.
- Aligns subsequent arguments of a command with the first argument, which is kept on the same line as the command.
- Indents "semantic" arguments (arguments starting with `key:`) by 2 spaces from the command start, instead of aligning with the first argument.

## Installation

```bash
npm install @pretty-dql/format-dql
# or
pnpm add @pretty-dql/format-dql
```

## Usage

```typescript
import { formatDql } from '@pretty-dql/format-dql';

const dql = '| fields entity, queryCount = toLong(queryCount), errorCount = toLong(errorCount)';
const formatted = formatDql(dql);
console.log(formatted);
```

