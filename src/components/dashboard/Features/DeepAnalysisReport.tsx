import React from 'react';

interface Section {
  title: string;
  content: string;
}

function cleanHeader(header: string): string {
  // Remove markdown artifacts: ###, numbers, **, extra punctuation
  return header.replace(/[#*]/g, '').replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim();
}

function parseSections(report: string): Section[] {
  // Split on headers like '### 1. **Opportunity Summary**' or '## 2. **Pros and Cons**'
  const regex = /(?:^|\n)#+\s*\d?\.?(?:\*\*)?([A-Za-z0-9 &()/-]+)(?:\*\*)?\n/g;
  const matches = [...report.matchAll(regex)];
  if (!matches.length) return [{ title: 'Summary', content: report }];

  const sections: Section[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : report.length;
    const title = cleanHeader(matches[i][1]);
    const content = report.slice(start, end).trim();
    sections.push({ title, content });
  }
  return sections;
}

// Render summary at top, then pros/cons, then others in order
export function DeepAnalysisReport({ report }: { report: string }) {
  const sections = parseSections(report);
  if (!sections.length) return null;

  // Find summary (usually first), then pros/cons, then rest
  const summary = sections.find(s => s.title.toLowerCase().includes('opportunity summary')) || sections[0];
  const prosCons = sections.find(s => s.title.toLowerCase().includes('pros and cons'));
  const rest = sections.filter(s => s !== summary && s !== prosCons);

  // Pros/cons split
  let pros = '', cons = '';
  if (prosCons) {
    const prosMatch = prosCons.content.match(/- Bullet point pros([\s\S]*?)- Bullet point cons/);
    const consMatch = prosCons.content.match(/- Bullet point cons([\s\S]*)/);
    if (prosMatch) pros = prosMatch[1].trim();
    if (consMatch) cons = consMatch[1].trim();
  }

  return (
    <div>
      {/* Summary at top */}
      {summary && (
        <div className="mb-8 rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
          <h2 className="text-4xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Summary of Business</h2>
          <div className="text-lg whitespace-pre-line text-foreground leading-relaxed">{summary.content}</div>
        </div>
      )}
      {/* Pros and Cons side by side */}
      {prosCons && (
        <div className="mb-8 rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-2xl mb-2 text-green-700 dark:text-green-400 tracking-tight">Pros</h3>
              <div className="text-base whitespace-pre-line text-foreground leading-relaxed">{pros}</div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-2xl mb-2 text-red-700 dark:text-red-400 tracking-tight">Cons</h3>
              <div className="text-base whitespace-pre-line text-foreground leading-relaxed">{cons}</div>
            </div>
          </div>
        </div>
      )}
      {/* All other sections in order */}
      {rest.map(section => {
        // Table rendering for BOM and Financial Forecast
        const isTableSection = /bill of materials|bom|financial forecast/i.test(section.title);
        const tableMatch = section.content.match(/\|(.|\n)*\|/g);
        return (
          <div key={section.title} className="mb-8 rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
            <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">{section.title}</h2>
            {isTableSection && tableMatch ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-primary/20 rounded-lg bg-background/70 mb-4">
                  <tbody>
                    {tableMatch[0]
                      .split('\n')
                      .filter(row => row.trim().length > 0)
                      .map((row, i) => (
                        <tr key={i}>
                          {row.split('|').slice(1, -1).map((cell, j) => (
                            <td key={j} className={`border px-3 py-2 ${i === 0 ? 'font-bold bg-primary/10 text-primary' : 'text-foreground bg-background/80'}`}>{cell.trim()}</td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-base whitespace-pre-line text-foreground leading-relaxed">{section.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
