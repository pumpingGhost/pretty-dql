import * as fs from 'fs';
import * as path from 'path';
import { collectTargetFiles } from '../../src/cli/collectTargetFiles.util';

const tmpRoot = path.join(__dirname, 'tmp-collect-target-files');

beforeAll(() => {
  if (!fs.existsSync(tmpRoot)) {
    fs.mkdirSync(tmpRoot);
  }
});

afterAll(() => {
  if (fs.existsSync(tmpRoot)) {
    // Best-effort cleanup
    const removeDir = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          removeDir(full);
        } else {
          fs.unlinkSync(full);
        }
      }
      fs.rmdirSync(dir);
    };

    removeDir(tmpRoot);
  }
});

describe('collectTargetFiles', () => {
  test('collects a single file with supported extension', () => {
    const filePath = path.join(tmpRoot, 'single', 'a.txt');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '');

    const result = collectTargetFiles([filePath]);

    expect(result).toEqual([path.resolve(filePath)]);
  });

  test('can restrict to specific extensions via options', () => {
    const filePathTxt = path.join(tmpRoot, 'restricted', 'a.txt');
    const filePathJs = path.join(tmpRoot, 'restricted', 'a.js');
    fs.mkdirSync(path.dirname(filePathTxt), { recursive: true });
    fs.writeFileSync(filePathTxt, '');
    fs.writeFileSync(filePathJs, '');

    const result = collectTargetFiles([path.dirname(filePathTxt)], { extensions: ['.txt'] });

    expect(result).toEqual([path.resolve(filePathTxt)]);
  });

  test('recursively collects files from directories', () => {
    const baseDir = path.join(tmpRoot, 'tree');
    const subDir = path.join(baseDir, 'sub');
    const nestedDir = path.join(subDir, 'nested');
    fs.mkdirSync(nestedDir, { recursive: true });

    const file1 = path.join(baseDir, 'root.txt');
    const file2 = path.join(subDir, 'sub.txt');
    const file3 = path.join(nestedDir, 'nested.dql');

    fs.writeFileSync(file1, '');
    fs.writeFileSync(file2, '');
    fs.writeFileSync(file3, '');

    const result = collectTargetFiles([baseDir]);

    expect(result).toEqual([file1, file2, file3].map((f) => path.resolve(f)).sort());
  });

  test('throws when path does not exist', () => {
    expect(() => collectTargetFiles(['definitely-does-not-exist-123.txt'])).toThrow(/Path not found:/);
  });
});
