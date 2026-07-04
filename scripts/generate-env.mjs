import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url)).replace(/\/scripts$/, '');
const envPath = resolve(rootDir, '.env');
const fallbackApiUrl = 'http://localhost:8080/api/v1';

function loadDotEnv(path) {
  if (!existsSync(path)) {
    return {};
  }

  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((values, line) => {
      const separator = line.indexOf('=');

      if (separator === -1) {
        return values;
      }

      const key = line.slice(0, separator).trim();
      const rawValue = line.slice(separator + 1).trim();
      values[key] = rawValue.replace(/^['"]|['"]$/g, '');
      return values;
    }, {});
}

const env = { ...loadDotEnv(envPath), ...process.env };
const apiBaseUrl = env.NG_APP_API_BASE_URL || fallbackApiUrl;
const environmentsDir = resolve(rootDir, 'src/environments');
const environmentFile = `export const environment = {
  production: false,
  apiBaseUrl: ${JSON.stringify(apiBaseUrl)}
};
`;
const productionFile = `export const environment = {
  production: true,
  apiBaseUrl: ${JSON.stringify(apiBaseUrl)}
};
`;

mkdirSync(environmentsDir, { recursive: true });
writeFileSync(resolve(environmentsDir, 'environment.ts'), environmentFile);
writeFileSync(resolve(environmentsDir, 'environment.prod.ts'), productionFile);
