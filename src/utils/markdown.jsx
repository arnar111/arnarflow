import React from 'react'

/**
 * Lightweight markdown renderer for ArnarFlow Notes.
 * Supports: headings, bold, italic, strikethrough, inline code,
 * code blocks, links, unordered/ordered lists, blockquotes,
 * horizontal rules, and checkboxes.
 * No external dependencies.
 */

// Parse inline markdown (bold, italic, code, links, strikethrough)
function parseInline(text) {
  if (!text) return text

  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Code (backtick) — must come first to avoid processing markdown inside code
    let match = remaining.match(/^`([^`]+)`/)
    if (match) {
      parts.push(
        <code key={key++} className="md-inline-code">{match[1]}</code>
      )
      remaining = remaining.slice(match[0].length)
      continue
    }

    // Bold + Italic (***text*** or ___text___)
    match = remaining.match(/^(\*\*\*|___)(.+?)\1/)
    if (match) {
      parts.push(
        <strong key={key++}><em>{parseInline(match[2])}</em></strong>
      )
      remaining = remaining.slice(match[0].length)
      continue
    }

    // Bold (**text** or __text__)
    match = remaining.match(/^(\*\*|__)(.+?)\1/)
    if (match) {
      parts.push(
        <strong key={key++}>{parseInline(match[2])}</strong>
      )
      remaining = remaining.slice(match[0].length)
      continue
    }

    // Italic (*text* or _text_)
    match = remaining.match(/^(\*|_)(.+?)\1/)
    if (match) {
      parts.push(
        <em key={key++}>{parseInline(match[2])}</em>
      )
      remaining = remaining.slice(match[0].length)
      continue
    }

    // Strikethrough (~~text~~)
    match = remaining.match(/^~~(.+?)~~/)
    if (match) {
      parts.push(
        <del key={key++}>{parseInline(match[1])}</del>
      )
      remaining = remaining.slice(match[0].length)
      continue
    }

    // Links [text](url)
    match = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (match) {
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="md-link">
          {match[1]}
        </a>
      )
      remaining = remaining.slice(match[0].length)
      continue
    }

    // Plain text — consume until next special character
    match = remaining.match(/^[^*_`~\[\\]+/)
    if (match) {
      parts.push(match[0])
      remaining = remaining.slice(match[0].length)
      continue
    }

    // Escaped character or single special char
    if (remaining[0] === '\\' && remaining.length > 1) {
      parts.push(remaining[1])
      remaining = remaining.slice(2)
    } else {
      parts.push(remaining[0])
      remaining = remaining.slice(1)
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

// Parse a block of markdown text into React elements
export function renderMarkdown(text) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let key = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block (``` ... ```)
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        <pre key={key++} className="md-code-block" data-lang={lang || undefined}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      elements.push(<hr key={key++} className="md-hr" />)
      i++
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const Tag = `h${level}`
      elements.push(
        <Tag key={key++} className={`md-h${level}`}>
          {parseInline(headingMatch[2])}
        </Tag>
      )
      i++
      continue
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      const quoteLines = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      elements.push(
        <blockquote key={key++} className="md-blockquote">
          {renderMarkdown(quoteLines.join('\n'))}
        </blockquote>
      )
      continue
    }

    // Unordered list
    if (/^\s*[-*+]\s/.test(line)) {
      const listItems = []
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[-*+]\s/, '')
        // Checkbox
        const cbMatch = itemText.match(/^\[([ xX])\]\s*(.*)/)
        if (cbMatch) {
          const checked = cbMatch[1] !== ' '
          listItems.push(
            <li key={key++} className="md-checkbox-item">
              <span className={`md-checkbox ${checked ? 'checked' : ''}`}>
                {checked ? '☑' : '☐'}
              </span>
              {parseInline(cbMatch[2])}
            </li>
          )
        } else {
          listItems.push(
            <li key={key++}>{parseInline(itemText)}</li>
          )
        }
        i++
      }
      elements.push(<ul key={key++} className="md-ul">{listItems}</ul>)
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s/.test(line)) {
      const listItems = []
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+\.\s/, '')
        listItems.push(
          <li key={key++}>{parseInline(itemText)}</li>
        )
        i++
      }
      elements.push(<ol key={key++} className="md-ol">{listItems}</ol>)
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="md-p">{parseInline(line)}</p>
    )
    i++
  }

  return elements
}

// Styles for markdown rendering
export const markdownStyles = `
  .md-preview {
    line-height: 1.7;
    font-size: 15px;
    color: var(--text-primary);
  }

  .md-preview .md-h1 {
    font-size: 1.75em;
    font-weight: 700;
    margin: 24px 0 12px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border-color);
  }

  .md-preview .md-h2 {
    font-size: 1.4em;
    font-weight: 600;
    margin: 20px 0 10px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border-color);
  }

  .md-preview .md-h3 {
    font-size: 1.2em;
    font-weight: 600;
    margin: 16px 0 8px 0;
  }

  .md-preview .md-h4,
  .md-preview .md-h5,
  .md-preview .md-h6 {
    font-size: 1em;
    font-weight: 600;
    margin: 12px 0 6px 0;
  }

  .md-preview .md-p {
    margin: 0 0 12px 0;
  }

  .md-preview .md-inline-code {
    background: var(--bg-tertiary, rgba(255,255,255,0.06));
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.9em;
    color: var(--accent);
  }

  .md-preview .md-code-block {
    background: var(--bg-tertiary, rgba(0,0,0,0.3));
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
    overflow-x: auto;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.88em;
    line-height: 1.5;
  }

  .md-preview .md-code-block code {
    color: var(--text-primary);
  }

  .md-preview .md-blockquote {
    border-left: 3px solid var(--accent);
    padding: 8px 16px;
    margin: 12px 0;
    background: var(--bg-secondary);
    border-radius: 0 8px 8px 0;
    color: var(--text-secondary);
  }

  .md-preview .md-blockquote p {
    margin: 4px 0;
  }

  .md-preview .md-ul,
  .md-preview .md-ol {
    margin: 8px 0 12px 0;
    padding-left: 24px;
  }

  .md-preview .md-ul li,
  .md-preview .md-ol li {
    margin: 4px 0;
  }

  .md-preview .md-checkbox-item {
    list-style: none;
    margin-left: -24px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .md-preview .md-checkbox {
    font-size: 1.1em;
    line-height: 1.5;
  }

  .md-preview .md-checkbox.checked {
    color: var(--accent);
  }

  .md-preview .md-link {
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }

  .md-preview .md-link:hover {
    border-bottom-color: var(--accent);
  }

  .md-preview .md-hr {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 20px 0;
  }

  .md-preview strong {
    font-weight: 600;
    color: var(--text-primary);
  }

  .md-preview em {
    font-style: italic;
  }

  .md-preview del {
    text-decoration: line-through;
    opacity: 0.6;
  }
`
