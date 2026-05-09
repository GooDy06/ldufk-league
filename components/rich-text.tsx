import type { ReactNode } from "react";

function isSafeUrl(value: string) {
  return value.startsWith("https://") || value.startsWith("http://");
}

function isImageUrl(value: string) {
  return /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(value);
}

function renderInline(text: string) {
  const nodes: ReactNode[] = [];
  const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const markdownLink = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    const href = markdownLink ? markdownLink[2] : token;
    const label = markdownLink ? markdownLink[1] : token;

    nodes.push(
      <a key={`${href}-${match.index}`} href={href} target="_blank" rel="noreferrer" className="font-bold text-accent underline decoration-accent/30 underline-offset-4 hover:text-white">
        {label}
      </a>
    );

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderParagraph(block: string, index: number) {
  const imageMatch = block.trim().match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
  if (imageMatch && isSafeUrl(imageMatch[2])) {
    return (
      <figure key={index} className="my-8 overflow-hidden rounded-2xl border border-line bg-surface">
        <img src={imageMatch[2]} alt={imageMatch[1]} className="max-h-[520px] w-full object-cover" />
        {imageMatch[1] ? <figcaption className="px-4 py-3 text-sm text-slate-500">{imageMatch[1]}</figcaption> : null}
      </figure>
    );
  }

  const rawImageUrl = block.trim();
  if (isSafeUrl(rawImageUrl) && isImageUrl(rawImageUrl)) {
    return (
      <figure key={index} className="my-8 overflow-hidden rounded-2xl border border-line bg-surface">
        <img src={rawImageUrl} alt="" className="max-h-[520px] w-full object-cover" />
      </figure>
    );
  }

  const lines = block.split("\n");
  return (
    <p key={index} className="text-lg leading-8 text-slate-300">
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {renderInline(line)}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

export function RichText({ value }: { value: string }) {
  const blocks = value
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return <div className="mt-6 grid gap-5">{blocks.map(renderParagraph)}</div>;
}
