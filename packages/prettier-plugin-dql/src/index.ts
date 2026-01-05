import { Plugin } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel';
import { parsers as typescriptParsers } from 'prettier/plugins/typescript';

import { formatDql } from '@pretty-dql/format-dql';

function transform(ast: any, comments?: any[]) {
  if (!ast || typeof ast !== 'object') {
    return;
  }

  if (Array.isArray(ast)) {
    ast.forEach((node) => transform(node, comments));
    return;
  }

  // Check for TaggedTemplateExpression: dql`...`
  if (ast.type === 'TaggedTemplateExpression' && ast.tag.type === 'Identifier' && ast.tag.name === 'dql') {
    formatTemplateLiteral(ast.quasi);
  }

  // Check for TemplateLiteral with comment: /* dql */ `...`
  if (ast.type === 'TemplateLiteral') {
    if (ast.leadingComments && ast.leadingComments.some((comment: any) => comment.value.trim() === 'dql')) {
      formatTemplateLiteral(ast);
    } else if (comments) {
      // Check global comments
      const start = ast.range ? ast.range[0] : ast.start;
      const precedingComment = comments.find((c) => {
        const end = c.range ? c.range[1] : c.end;
        return end < start && start - end < 20 && c.value.trim() === 'dql';
      });
      if (precedingComment) {
        formatTemplateLiteral(ast);
      }
    }
  }

  // Recurse
  for (const key in ast) {
    if (key !== 'loc' && key !== 'range' && key !== 'comments' && key !== 'leadingComments' && key !== 'tokens') {
      transform(ast[key], comments);
    }
  }
}

function formatTemplateLiteral(node: any) {
  if (node.quasis.length === 1) {
    const raw = node.quasis[0].value.raw;
    try {
      const formatted = formatDql(raw);
      // Update the node
      node.quasis[0].value.raw = formatted;
      // We also need to update 'cooked' if possible, but 'raw' is what's used for printing usually?
      // Prettier uses 'raw' for printing template literals.
      node.quasis[0].value.cooked = formatted;
    } catch {
      // Ignore errors
    }
  } else {
    // Handle template literals with expressions
    let raw = '';
    const placeholders: string[] = [];

    for (let i = 0; i < node.quasis.length; i++) {
      raw += node.quasis[i].value.raw;
      if (i < node.quasis.length - 1) {
        const placeholder = `dql_placeholder_${i}`;
        placeholders.push(placeholder);
        raw += placeholder;
      }
    }

    try {
      console.error('Formatting raw with placeholders:', raw);
      const formatted = formatDql(raw);
      console.error('Formatted result:', formatted);

      // Split the formatted string back into quasis
      // We use a regex that matches any of the placeholders
      const placeholderRegex = /dql_placeholder_\d+/g;
      const parts = formatted.split(placeholderRegex);

      if (parts.length !== node.quasis.length) {
        console.error('Parts length mismatch:', parts.length, node.quasis.length);
        console.error('Formatted:', formatted);
      }

      if (parts.length === node.quasis.length) {
        for (let i = 0; i < parts.length; i++) {
          node.quasis[i].value.raw = parts[i];
          node.quasis[i].value.cooked = parts[i];
        }
      }
    } catch (e) {
      console.error('Error formatting DQL with placeholders:', e);
      // Ignore errors
    }
  }
}

function dql(strings: TemplateStringsArray, ...values: any[]) {
  return strings.reduce((result, str, i) => {
    return result + str + (i < values.length ? values[i] : '');
  }, '');
}

const dqlPlugin: Plugin & { dql: typeof dql } = {
  parsers: {
    dql: {
      parse: (text) => text, // Prettier requires a parser; we just return the raw text
      astFormat: 'dql', // Custom AST format identifier
      locStart: () => 0,
      locEnd: (node) => (typeof node === 'string' ? node.length : 0),
    },
    babel: {
      ...babelParsers.babel,
      parse: (text, options) => {
        const ast = babelParsers.babel.parse(text, options);
        transform(ast, ast.comments);
        return ast;
      },
    },
    typescript: {
      ...typescriptParsers.typescript,
      parse: (text, options) => {
        const ast = typescriptParsers.typescript.parse(text, options);
        transform(ast, ast.comments);
        return ast;
      },
    },
  },
  printers: {
    dql: {
      print: (path) => {
        const dql = path.getValue(); // Get the raw DQL string
        return formatDql(dql); // Format the DQL string using your function
      },
    },
  },
  languages: [
    {
      name: 'DQL',
      parsers: ['dql'],
      extensions: ['.dql'], // Optional: Add support for `.dql` files
      linguistLanguageId: 1406, // Arbitrary ID
    },
  ],
  dql,
};

export = dqlPlugin;
