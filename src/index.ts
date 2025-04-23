import path from 'node:path';

import analyzer from '@/core/analyzer';

const entryPath = path.resolve(__dirname, '../example/index.jsx');

analyzer(entryPath);
