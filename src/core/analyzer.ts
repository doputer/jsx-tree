import { analyzeFile, buildHierarchy } from '@/core/parser';
import { Component, Definition, Path } from '@/types';

const analyzer = (entry: Path) => {
  const analyzedFiles = new Map<Path, Record<Component, Definition>>();
  const allDefinitions = new Map<Component, Definition>();

  analyzeFile(entry, analyzedFiles, allDefinitions);

  const tree = buildHierarchy(entry, allDefinitions);

  console.log('###');
  console.dir(tree.components['App'], { depth: null });
};

export default analyzer;
