# Pretty DQL

A simple and efficient DQL (Dynatrace Query Language) formatter.

## Features

- Formats DQL queries with proper indentation and line breaks.
- Handles quoted strings correctly.
- Enforces spacing rules for brackets `[]`, `{}` and colons `:`.
- Splits commands starting with `|` into new lines.
- Aligns arguments for better readability.

## Usage

```typescript
import { formatDql } from './src/format-dql';

const dql = '| fields entity, queryCount = toLong(queryCount), errorCount = toLong(errorCount)';
const formatted = formatDql(dql);
console.log(formatted);
```

## CLI

A CLI tool to parse files and search for DQL commands to pass them to the DQL formatter.

### Usage

Build the project first so the CLI entrypoint is available in `dist` and then link it globally:

```bash
npm run build
npm link
```

After linking, you can use the `pretty-dql` command directly:

```bash
pretty-dql <path...> [--ext=.ts,.tsx]
```

Where `<path...>` can be one or more:

- Individual files
- Directories (they will be scanned recursively)

By default, `dql-format` looks for DQL strings inside files with the following extensions:

- `.txt`
- `.dql`
- `.js`
- `.jsx`
- `.ts`
- `.tsx`

You can override the extensions to scan using the optional `--ext` flag. Pass a comma-separated
list of extensions (with or without the leading dot). Examples:

- `--ext=.ts` – only `.ts` files
- `--ext=.ts,.tsx` – `.ts` and `.tsx` files
- `--ext=ts,tsx` – same as above; dots are added automatically

For every matching file, the tool:

1. Reads the file contents.
2. Extracts strings that contain DQL queries.
3. Formats each DQL command and prints it to `stdout`, one per line.

### Raw string mode

You can also format raw DQL strings directly, without reading from files, using the `--raw` flag:

```bash
pretty-dql --raw "data from logs" "| filter status == 200"
```

In this mode, each argument after `--raw` is treated as a DQL command string and passed directly to
`formatDqlCommand`, and the formatted result is printed to `stdout`.

#### Examples

Parse a single file:

```bash
pretty-dql examples/sample.ts
```

Parse multiple files:

```bash
pretty-dql src/file1.ts src/file2.ts tests/sample.txt
```

Parse an entire directory (recursively):

```bash
pretty-dql src
```

Mix files and directories:

```bash
pretty-dql src tests some-other-file.dql
```

Restrict to specific extensions:

```bash
pretty-dql src --ext=.ts,.tsx
```

Format raw DQL strings:

```bash
pretty-dql --raw "data from logs" "| filter status == 200"
```

#### Exit codes

The CLI uses the following exit codes:

- `0` – Success
    - At least one path was provided and at least one file was processed, or raw strings were formatted.
- `1` – Incorrect usage or no matching files
    - No positional paths were provided in file mode, or no strings were provided in `--raw` mode.
    - If no matching files are found under the given paths, it prints `No matching files found` and exits with `1`.
- `2` – File or path not found
    - At least one of the provided paths does not exist.
- `3` – Error reading a file
    - An unexpected I/O error occurred while reading a file.

## Development

### Install Dependencies

```bash
pnpm install
```

### Build

```bash
pnpm run build
```

### Run Tests

```bash
pnpm test
```

### Linting

```bash
pnpm run lint
```

### Formatting

```bash
pnpm run format
```

