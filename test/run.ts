import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { mockBrowser } from './mock-browser';

mockBrowser();

// working directory is root/build, never the less what __dirname is showing
const cwd = process.cwd();

function getAllFiles(dirPath: string, arrayOfFiles: Array<string> = []) {
  const files = readdirSync(dirPath);
  files.forEach(file => {
    if (statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      const relativePath = join(dirPath, '/', file);
      const absolutePath = join(cwd, relativePath);
      arrayOfFiles.push(absolutePath);
    }
  });

  return arrayOfFiles;
}

console.log(cwd)
const libFiles  = getAllFiles('out/src').filter(f => f.endsWith('.js'));
const testFiles = getAllFiles('out/src').filter(f => f.endsWith('.spec.js'));

const usedFiles = [...libFiles, ...testFiles];
console.log('usedFiles: ', usedFiles);

for (const testFile of usedFiles) {
  require(testFile);
}
