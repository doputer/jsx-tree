import { analyzeFile, buildHierarchy } from '@/core/parser';
import { Path } from '@/types';

const analyzer = (entry: Path) => {
  const allDefinitions = analyzeFile(entry);
  const tree = buildHierarchy(entry, allDefinitions);

  console.log('###');
  console.dir(tree.components['App'], { depth: null });
};

export default analyzer;
