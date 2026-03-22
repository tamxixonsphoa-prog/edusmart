/**
 * ContentRenderer — Shared helper to render question content with inline images.
 * Tách markdown image `![alt](src)` ra khỏi text và render cả text + ảnh đúng cách.
 * Dùng chung cho tất cả game components.
 */
import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ContentRendererProps {
  content: string;
  className?: string;
  imageMaxHeight?: number;
}

/**
 * Tách content thành các phần text và image.
 * Input:  "Câu hỏi về glucose\n\n![Hình 1](data:image/png;base64,...)\n\nChất thuộc loại..."
 * Output: [{ type: 'text', value: 'Câu hỏi về glucose' }, { type: 'image', alt: 'Hình 1', src: 'data:...' }, ...]
 */
export function splitContentParts(content: string): Array<{ type: 'text'; value: string } | { type: 'image'; alt: string; src: string }> {
  if (!content) return [];
  
  const parts: Array<{ type: 'text'; value: string } | { type: 'image'; alt: string; src: string }> = [];
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  
  while ((match = imgRegex.exec(content)) !== null) {
    // Text before the image
    const textBefore = content.slice(lastIdx, match.index).trim();
    if (textBefore) {
      parts.push({ type: 'text', value: textBefore });
    }
    // The image
    parts.push({ type: 'image', alt: match[1], src: match[2] });
    lastIdx = match.index + match[0].length;
  }
  
  // Text after last image
  const remaining = content.slice(lastIdx).trim();
  if (remaining) {
    parts.push({ type: 'text', value: remaining });
  }
  
  return parts;
}

/**
 * Kiểm tra nhanh content có chứa ảnh markdown không.
 */
export function hasImages(content: string): boolean {
  return /!\[[^\]]*\]\([^)]+\)/.test(content || '');
}

/**
 * Lấy text thuần (bỏ markdown image syntax).
 */
export function getTextOnly(content: string): string {
  return (content || '').replace(/!\[[^\]]*\]\([^)]+\)/g, '').trim();
}

/**
 * React component render content câu hỏi: text + ảnh inline.
 * Sử dụng <Markdown> cho text (hỗ trợ math/LaTeX), <img> cho ảnh.
 */
export default function ContentRenderer({ content, className = '', imageMaxHeight = 180 }: ContentRendererProps) {
  const parts = splitContentParts(content);
  
  if (parts.length === 0) return null;
  
  // Nếu không có ảnh, render bình thường bổng <Markdown>
  if (!parts.some(p => p.type === 'image')) {
    return (
      <div className={className}>
        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {content}
        </Markdown>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return (
            <div key={idx}>
              <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {part.value}
              </Markdown>
            </div>
          );
        }
        // Image
        return (
          <div key={idx} className="flex justify-center my-3">
            <img
              src={part.src}
              alt={part.alt}
              style={{ maxHeight: imageMaxHeight, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
        );
      })}
    </div>
  );
}
