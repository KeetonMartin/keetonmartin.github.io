const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

// Renders copy from site.json, turning [text](href) into links.
export default function Rich({ text }) {
  const parts = [];
  let last = 0;

  for (const match of text.matchAll(LINK)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a key={match.index} href={match[2]}>
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
