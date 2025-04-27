import { getJSXName } from '@/core/parser';
import {
  createFragmentNode,
  createHTMLElementNode,
  createJSXMemberExpressionNode,
} from '@/test/utils/mock-node';

describe('getJSXName 함수', () => {
  it('Fragment를 처리한다', () => {
    const mockNode = createFragmentNode();
    const result = getJSXName(mockNode);

    expect(result).toBe('Fragment');
  });

  it('일반 태그를 처리한다', () => {
    const mockNode = createHTMLElementNode('div');
    const result = getJSXName(mockNode);

    expect(result).toBe('div');
  });

  it('접근 표현식 태그를 처리한다', () => {
    const mockNode = createJSXMemberExpressionNode('React', 'Fragment');
    const result = getJSXName(mockNode);

    expect(result).toBe('React.Fragment');
  });

  it('알 수 없는 태그를 처리한다', () => {
    const mockNode = null;
    const result = getJSXName(mockNode);

    expect(result).toBe('Unknown');
  });
});
