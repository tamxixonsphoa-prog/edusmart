import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Props {
  children: string;
  className?: string;
  inline?: boolean;
}

/**
 * Renders text with KaTeX math support via ReactMarkdown.
 * Inline math: $...$  |  Display math: $$...$$
 */
export default function MathText({ children, className = '', inline = false }: Props) {
  if (!children) return null;

  const Tag = inline ? 'span' : 'div';

  return (
    <Tag className={className} style={inline ? { display: 'inline' } : undefined}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children: c }) => <>{c}</>,
        }}
      >
        {children}
      </ReactMarkdown>
    </Tag>
  );
}
