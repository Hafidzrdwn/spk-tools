#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.venv',
  '.github',
  'coverage',
]);

const VALID_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function isDirectiveComment(text) {
  const trimmed = text.trim();
  const directivePatterns = [
    /^\/\/\s*@ts-(ignore|expect-error|nocheck|check)/,
    /^\/\*\s*@ts-(ignore|expect-error|nocheck|check)/,
    /^\/\/\/\s*<reference/,
    /^\/\/\s*eslint-disable/,
    /^\/\*\s*eslint-disable/,
    /^\/\/\s*eslint-enable/,
    /^\/\*\s*eslint-enable/,
    /@vite-ignore/,
    /istanbul\s+ignore/,
    /c8\s+ignore/,
  ];
  return directivePatterns.some((pattern) => pattern.test(trimmed));
}

function getAllFiles(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        getAllFiles(path.join(dirPath, entry.name), fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (VALID_EXTENSIONS.has(ext)) {
        fileList.push(path.join(dirPath, entry.name));
      }
    }
  }
  return fileList;
}

/**
 * Scan a file and return all comments and their metadata.
 */
export function analyzeComments(sourceCode, filePath = 'file.tsx') {
  const isJsx = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    isJsx ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard,
    sourceCode
  );

  const tokens = [];
  let token;
  while ((token = scanner.scan()) !== ts.SyntaxKind.EndOfFileToken) {
    tokens.push({
      kind: token,
      pos: scanner.getTokenPos(),
      end: scanner.getTextPos(),
      text: scanner.getTokenText(),
    });
  }

  const comments = [];
  const rangesToRemove = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // Check for JSX Comment pattern: { /* comment */ }
    if (
      t.kind === ts.SyntaxKind.OpenBraceToken ||
      t.kind === ts.SyntaxKind.FirstPunctuation
    ) {
      if (t.text === '{') {
        let nextIdx = i + 1;
        while (
          nextIdx < tokens.length &&
          tokens[nextIdx].kind === ts.SyntaxKind.WhitespaceTrivia
        ) {
          nextIdx++;
        }

        if (
          nextIdx < tokens.length &&
          tokens[nextIdx].kind === ts.SyntaxKind.MultiLineCommentTrivia
        ) {
          const commentTok = tokens[nextIdx];
          let closeIdx = nextIdx + 1;
          while (
            closeIdx < tokens.length &&
            tokens[closeIdx].kind === ts.SyntaxKind.WhitespaceTrivia
          ) {
            closeIdx++;
          }

          if (
            closeIdx < tokens.length &&
            (tokens[closeIdx].kind === ts.SyntaxKind.CloseBraceToken ||
              tokens[closeIdx].text === '}')
          ) {
            // It's a full JSX comment container: { /* ... */ }
            const closeTok = tokens[closeIdx];
            const isDirective = isDirectiveComment(commentTok.text);
            const line = getLineNumber(sourceCode, t.pos);

            comments.push({
              type: 'jsx',
              text: commentTok.text,
              pos: t.pos,
              end: closeTok.end,
              line,
              isDirective,
            });

            if (!isDirective) {
              rangesToRemove.push({
                start: t.pos,
                end: closeTok.end,
                type: 'jsx',
              });
            }

            i = closeIdx;
            continue;
          }
        }
      }
    }

    // Normal Single-Line or Multi-Line Comments
    if (
      t.kind === ts.SyntaxKind.SingleLineCommentTrivia ||
      t.kind === ts.SyntaxKind.MultiLineCommentTrivia
    ) {
      const isDirective = isDirectiveComment(t.text);
      const line = getLineNumber(sourceCode, t.pos);
      const type =
        t.kind === ts.SyntaxKind.SingleLineCommentTrivia ? 'line' : 'block';

      comments.push({
        type,
        text: t.text,
        pos: t.pos,
        end: t.end,
        line,
        isDirective,
      });

      if (!isDirective) {
        rangesToRemove.push({
          start: t.pos,
          end: t.end,
          type,
        });
      }
    }
  }

  return { comments, rangesToRemove };
}

function getLineNumber(text, pos) {
  let line = 1;
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

/**
 * Remove comments while preserving clean formatting.
 */
export function stripComments(sourceCode, filePath = 'file.tsx') {
  const { rangesToRemove } = analyzeComments(sourceCode, filePath);
  if (rangesToRemove.length === 0) {
    return sourceCode;
  }

  // Sort ranges descending to replace from back to front
  rangesToRemove.sort((a, b) => b.start - a.start);

  let result = sourceCode;

  for (const range of rangesToRemove) {
    const { start, end } = range;

    // Determine if the comment is standalone on its line
    // Look backwards to see if there is only whitespace before it on this line
    let lineStart = start;
    while (lineStart > 0 && result[lineStart - 1] !== '\n') {
      lineStart--;
    }
    const textBefore = result.slice(lineStart, start);
    const isOnlyWhitespaceBefore = textBefore.trim().length === 0;

    // Look forwards to see if there is only whitespace until newline or EOF
    let lineEnd = end;
    while (lineEnd < result.length && result[lineEnd] !== '\n' && result[lineEnd] !== '\r') {
      lineEnd++;
    }
    const textAfter = result.slice(end, lineEnd);
    const isOnlyWhitespaceAfter = textAfter.trim().length === 0;

    if (isOnlyWhitespaceBefore && isOnlyWhitespaceAfter) {
      // Standalone comment on its own line: remove the entire line including newline
      let deleteEnd = lineEnd;
      if (deleteEnd < result.length && result[deleteEnd] === '\r') deleteEnd++;
      if (deleteEnd < result.length && result[deleteEnd] === '\n') deleteEnd++;

      result = result.slice(0, lineStart) + result.slice(deleteEnd);
    } else if (isOnlyWhitespaceAfter) {
      // Inline comment at the end of a line with code before it:
      // Trim trailing whitespace from the code before the comment
      let trimBefore = start;
      while (trimBefore > lineStart && (result[trimBefore - 1] === ' ' || result[trimBefore - 1] === '\t')) {
        trimBefore--;
      }
      result = result.slice(0, trimBefore) + result.slice(end);
    } else {
      // Inline comment in the middle of a line
      result = result.slice(0, start) + result.slice(end);
    }
  }

  // Collapse multiple consecutive empty lines (more than 2 newlines -> 2 newlines)
  result = result.replace(/(\r?\n){3,}/g, '\n\n');

  return result;
}

// CLI Execution
async function main() {
  const args = process.argv.slice(2);
  const isCheckMode = args.includes('--check') || args.includes('check');
  const isDryRun = args.includes('--dry-run') || args.includes('-d');
  const isCleanMode = args.includes('--clean') || args.includes('--strip') || args.includes('--fix') || (!isCheckMode);

  // Target directory or files
  const targetArgs = args.filter((arg) => !arg.startsWith('-') && arg !== 'check' && arg !== 'clean');
  const targetPaths = targetArgs.length > 0 ? targetArgs : ['src'];

  const allFiles = [];
  for (const tPath of targetPaths) {
    const resolved = path.resolve(process.cwd(), tPath);
    if (fs.existsSync(resolved)) {
      if (fs.statSync(resolved).isDirectory()) {
        getAllFiles(resolved, allFiles);
      } else {
        allFiles.push(resolved);
      }
    }
  }

  if (allFiles.length === 0) {
    console.log('Tidak ada file kode yang ditemukan untuk diproses.');
    process.exit(0);
  }

  console.log(`\n🔍 Memeriksa ${allFiles.length} berkas kode...`);

  let filesWithCommentsCount = 0;
  let totalCommentsFound = 0;
  let totalStrippedCount = 0;

  const report = [];

  for (const file of allFiles) {
    const relPath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf8');
    const { comments } = analyzeComments(content, file);

    const nonDirectiveComments = comments.filter((c) => !c.isDirective);

    if (nonDirectiveComments.length > 0) {
      filesWithCommentsCount++;
      totalCommentsFound += nonDirectiveComments.length;

      report.push({
        file: relPath,
        comments: nonDirectiveComments,
      });

      if (isCleanMode && !isCheckMode) {
        const cleaned = stripComments(content, file);
        if (!isDryRun) {
          fs.writeFileSync(file, cleaned, 'utf8');
        }
        totalStrippedCount += nonDirectiveComments.length;
      }
    }
  }

  // Render Check / Report Results
  if (isCheckMode || isDryRun) {
    if (report.length === 0) {
      console.log('✅ Bersih! Tidak ditemukan komentar tidak penting di seluruh berkas kode.');
      process.exit(0);
    }

    console.log(`\n⚠️  Ditemukan ${totalCommentsFound} komentar pada ${filesWithCommentsCount} berkas:\n`);
    for (const item of report) {
      console.log(`📄 \x1b[36m${item.file}\x1b[0m (${item.comments.length} komentar)`);
      for (const c of item.comments.slice(0, 5)) {
        const preview = c.text.replace(/\r?\n\s*/g, ' ').slice(0, 60);
        console.log(`   \x1b[90mBaris ${c.line} [${c.type}]:\x1b[0m ${preview}...`);
      }
      if (item.comments.length > 5) {
        console.log(`   \x1b[90m... dan ${item.comments.length - 5} komentar lainnya\x1b[0m`);
      }
    }

    console.log(`\nRingkasan: ${totalCommentsFound} komentar ditemukan di ${filesWithCommentsCount} file.`);
    if (isCheckMode) {
      console.log(`💡 Jalankan \x1b[32mnpm run comments:clean\x1b[0m untuk menghapus seluruh komentar secara otomatis.\n`);
      process.exit(1);
    }
  } else {
    // Clean mode executed
    console.log(`\n✨ Selesai membersihkan komentar!`);
    console.log(`- Berkas yang diperbarui: ${filesWithCommentsCount}`);
    console.log(`- Total komentar dihapus: ${totalStrippedCount}`);
    console.log(`- Directive esensial (@ts-*, @vite-ignore, eslint-*) tetap aman terjaga.\n`);
  }
}

main().catch((err) => {
  console.error('Terjadi kesalahan saat memproses komentar:', err);
  process.exit(1);
});
