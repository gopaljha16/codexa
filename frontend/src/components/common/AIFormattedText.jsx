import React, { useState } from "react";

// Lightweight syntax highlighter using regex per language
const highlightSyntax = (code, language) => {
  const languages = {
    javascript: {
      keywords:
        /\b(const|let|var|function|return|if|else|for|while|class|new|this|try|catch|finally|throw|switch|case|break|continue|import|from|export|default|await|async)\b/g,
      comment: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
      string: /(["'`].*?["'`])/g,
      number: /\b(\d+(?:\.\d+)?)\b/g,
    },
    python: {
      keywords:
        /\b(def|class|if|elif|else|return|import|from|as|for|while|try|except|finally|raise|with|lambda|yield|pass|break|continue)\b/g,
      comment: /(#[^\n]*)/g,
      string: /(["']{3}[\s\S]*?["']{3}|["'][^"']*["'])/g,
      number: /\b(\d+(?:\.\d+)?)\b/g,
    },
    cpp: {
      keywords:
        /\b(int|float|double|char|void|return|if|else|for|while|class|struct|public|private|protected|new|delete|this|namespace|using|include|std)\b/g,
      comment: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
      string: /(["'].*?["'])/g,
      number: /\b(\d+(?:\.\d+)?)\b/g,
    },
    java: {
      keywords:
        /\b(public|private|protected|class|interface|enum|static|void|int|long|float|double|boolean|if|else|for|while|return|new|this|try|catch|finally|throw|package|import)\b/g,
      comment: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
      string: /(["'].*?["'])/g,
      number: /\b(\d+(?:\.\d+)?)\b/g,
    },
  };

  const rules = languages[language] || languages.javascript;
  return code.split("\n").map((line, i) => {
    let html = line
      .replace(rules.comment, '<span class="text-gray-500">$&</span>')
      .replace(rules.string, '<span class="text-green-400">$&</span>')
      .replace(rules.keywords, '<span class="text-blue-400">$&</span>')
      .replace(rules.number, '<span class="text-purple-400">$&</span>');
    return (
      <span
        key={i}
        className="block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
};

const detectLanguage = (code) => {
  if (!code) return "javascript";
  const firstLine = code.split("\n")[0].trim().toLowerCase();
  if (firstLine.startsWith("javascript") || code.includes("function"))
    return "javascript";
  if (firstLine.startsWith("python") || code.includes("def ")) return "python";
  if (
    firstLine.startsWith("cpp") ||
    code.includes("#include") ||
    code.includes("std::")
  )
    return "cpp";
  if (firstLine.startsWith("java") || code.includes("public class"))
    return "java";
  return "javascript";
};

const CodeBlock = ({ rawCode }) => {
  const [copied, setCopied] = useState(false);
  // Remove optional language label from first line (```lang) if present
  const code = rawCode.replace(/^\s*([a-zA-Z0-9+#-]+)?\n/, (m, g1) =>
    g1 ? "" : m
  );
  const language = detectLanguage(rawCode);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="my-4 relative group rounded-xl border border-gray-700/60 bg-[#1e1e1e] shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/60 bg-gray-800/60">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-300">
          {language}
        </span>
        <button
          onClick={copy}
          className="text-xs px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
        >
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>
      <pre
        className="p-4 overflow-x-auto text-sm"
        style={{
          fontFamily:
            '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Heading = ({ level = 2, children }) => {
  const sizes = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-base",
    5: "text-base",
    6: "text-sm",
  };
  const size = sizes[level] || sizes[2];
  return (
    <div className={`font-bold ${size} text-white mb-2 mt-3`}>{children}</div>
  );
};

export default function AIFormattedText({ text }) {
  if (text === null || text === undefined) return null;
  const safeText = typeof text === "string" ? text : String(text);

  let segments;
  try {
    // Split by triple backtick blocks to isolate code blocks first
    segments = safeText.split(/(```[\s\S]*?```)/g);
  } catch (e) {
    // Fallback: render as plain pre-wrapped text on any parsing issue
    return (
      <p className="text-gray-200 leading-relaxed mb-3 whitespace-pre-wrap">
        {safeText}
      </p>
    );
  }

  const renderSegment = (seg, idx) => {
    if (seg.startsWith("```") && seg.endsWith("```")) {
      const inner = seg.slice(3, -3);
      return <CodeBlock key={idx} rawCode={inner} />;
    }

    // Split into lines for headings and paragraphs
    let lines = [];
    try {
      lines = seg.split("\n");
    } catch {
      return (
        <p
          key={idx}
          className="text-gray-200 leading-relaxed mb-3 whitespace-pre-wrap"
        >
          {seg}
        </p>
      );
    }
    const blocks = [];
    let paragraph = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        blocks.push(
          <p
            key={`p-${blocks.length}`}
            className="text-gray-200 leading-relaxed mb-3"
          >
            {paragraph
              .join("\n")
              .split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|~~.*?~~|`[^`]+`)/g)
              .map((segment, i) => {
                if (segment.startsWith("**") && segment.endsWith("**")) {
                  return (
                    <strong key={i} className="font-semibold text-white">
                      {segment.slice(2, -2)}
                    </strong>
                  );
                } else if (segment.startsWith("__") && segment.endsWith("__")) {
                  return (
                    <strong key={i} className="font-semibold text-white">
                      {segment.slice(2, -2)}
                    </strong>
                  );
                } else if (segment.startsWith("*") && segment.endsWith("*")) {
                  return (
                    <em key={i} className="italic text-gray-300">
                      {segment.slice(1, -1)}
                    </em>
                  );
                } else if (segment.startsWith("_") && segment.endsWith("_")) {
                  return (
                    <em key={i} className="italic text-gray-300">
                      {segment.slice(1, -1)}
                    </em>
                  );
                } else if (segment.startsWith("~~") && segment.endsWith("~~")) {
                  return (
                    <del key={i} className="text-gray-400">
                      {segment.slice(2, -2)}
                    </del>
                  );
                } else if (segment.startsWith("`") && segment.endsWith("`")) {
                  const code = segment.slice(1, -1);
                  return (
                    <code
                      key={i}
                      className="bg-gray-800 text-orange-300 px-1 py-0.5 rounded text-sm border border-gray-700"
                      style={{
                        fontFamily:
                          '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      {code}
                    </code>
                  );
                }
                return segment;
              })}
          </p>
        );
        paragraph = [];
      }
    };

    for (const line of lines) {
      const headingMatch = line.match(/^\s*(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        flushParagraph();
        const level = 2; // normalize heading size for chat context
        blocks.push(
          <Heading key={`h-${blocks.length}`} level={level}>
            {headingMatch[2]}
          </Heading>
        );
        continue;
      }

      const listMatch = line.match(/^\s*([-*•]|\d+\.)\s+(.*)$/);
      if (listMatch) {
        flushParagraph();
        // Simple list item (unordered or ordered)
        blocks.push(
          <ul
            key={`ul-${blocks.length}`}
            className="list-disc pl-6 mb-3 space-y-1 text-gray-200"
          >
            <li>{listMatch[2]}</li>
          </ul>
        );
        continue;
      }

      // Tip or warning
      if (line.startsWith("💡 ")) {
        flushParagraph();
        blocks.push(
          <div
            key={`tip-${blocks.length}`}
            className="my-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-blue-200"
          >
            <div className="flex items-start gap-2">
              <span className="text-blue-400">💡</span>
              <span>{line.replace(/^💡\s+/, "")}</span>
            </div>
          </div>
        );
        continue;
      }

      if (line.startsWith("⚠️ ")) {
        flushParagraph();
        blocks.push(
          <div
            key={`warn-${blocks.length}`}
            className="my-3 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg text-orange-200"
          >
            <div className="flex items-start gap-2">
              <span className="text-orange-400">⚠️</span>
              <span>{line.replace(/^⚠️\s+/, "")}</span>
            </div>
          </div>
        );
        continue;
      }

      // Accumulate paragraph lines
      paragraph.push(line);
    }

    flushParagraph();
    return (
      <div key={idx} className="space-y-1">
        {blocks}
      </div>
    );
  };

  return (
    <div className="leading-relaxed space-y-3">
      {segments.map(renderSegment)}
    </div>
  );
}
