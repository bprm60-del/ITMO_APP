/**
 * Frame element stored in the stack for tracking braces and nesting depth.
 */
export interface BlockFrame {
    char: string;
}

/**
 * Report containing the calculated code complexity metrics.
 */
export interface ComplexityReport {
    linesOfCode: number;
    cyclomaticComplexity: number;
    maxNestingDepth: number;
    branchBreakdown: Record<string, number>;
    riskLevel: 'Низкий (A)' | 'Умеренный (B)' | 'Высокий (C)' | 'Критический (D)';
}

/**
 * Generic Stack data structure for brace matching and nesting depth analysis.
 */
export class Stack<T> {
    private items: T[] = [];

    public push(item: T): void {
        this.items.push(item);
    }

    public pop(): T | undefined {
        return this.items.pop();
    }

    public peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    public size(): number {
        return this.items.length;
    }

    public isEmpty(): boolean {
        return this.items.length === 0;
    }
}

/**
 * Code analyzer implementing McCabe cyclomatic complexity and nesting depth calculation.
 */
export class CodeComplexityAnalyzer {
    /**
     * Branching operators and keywords that increase cyclomatic complexity (+1 per decision point).
     */
    private readonly branchPatterns: [string, RegExp][] = [
        ['if', /\bif\b/g],
        ['else if', /\belse\s+if\b/g],
        ['ternary (?)', /\?(?!\?|\.)/g],
        ['for', /\bfor\b/g],
        ['while', /\bwhile\b/g],
        ['case', /\bcase\b/g],
        ['catch', /\bcatch\b/g],
        ['logical AND (&&)', /&&/g],
        ['logical OR (||)', /\|\|/g],
        ['nullish (??)', /\?\?/g]
    ];

    /**
     * Strips comments and string literals to prevent false positives in text blocks.
     */
    public stripCommentsAndStrings(code: string): string {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // multi-line comments /* ... */
            .replace(/\/\/.*$/gm, '')         // single-line comments // ...
            .replace(/"(?:\\.|[^"\\])*"/g, '""') // double-quoted strings
            .replace(/'(?:\\.|[^'\\])*'/g, "''") // single-quoted strings
            .replace(/`(?:\\.|[^`\\])*`/g, '``'); // template literals
    }

    /**
     * Analyzes source code and produces a complexity metrics report.
     * @param rawCode Source code text
     */
    public analyze(rawCode: string): ComplexityReport {
        const cleanCode = this.stripCommentsAndStrings(rawCode);
        const lines = rawCode.split(/\r?\n/).filter(line => line.trim().length > 0);

        // 1. Count branching decision points using Map data structure
        const branchCounts = new Map<string, number>();
        let totalBranches = 0;

        for (const [name, regex] of this.branchPatterns) {
            const matches = cleanCode.match(regex);
            const count = matches ? matches.length : 0;
            if (count > 0) {
                branchCounts.set(name, count);
                totalBranches += count;
            }
        }

        // McCabe Cyclomatic Complexity: base 1 + total decision branches
        const cyclomaticComplexity = 1 + totalBranches;

        // 2. Track maximum nesting depth using generic Stack
        const stack = new Stack<BlockFrame>();
        let maxDepth = 0;

        for (let i = 0; i < cleanCode.length; i++) {
            const ch = cleanCode[i];
            if (ch === '{') {
                stack.push({ char: '{' });
                if (stack.size() > maxDepth) {
                    maxDepth = stack.size();
                }
            } else if (ch === '}') {
                if (!stack.isEmpty()) {
                    stack.pop();
                }
            }
        }

        // 3. Determine refactoring risk category
        let riskLevel: ComplexityReport['riskLevel'] = 'Низкий (A)';
        if (cyclomaticComplexity > 15 || maxDepth > 5) {
            riskLevel = 'Критический (D)';
        } else if (cyclomaticComplexity > 10 || maxDepth > 4) {
            riskLevel = 'Высокий (C)';
        } else if (cyclomaticComplexity > 5 || maxDepth > 3) {
            riskLevel = 'Умеренный (B)';
        }

        const breakdown: Record<string, number> = {};
        branchCounts.forEach((count, key) => {
            breakdown[key] = count;
        });

        return {
            linesOfCode: lines.length,
            cyclomaticComplexity,
            maxNestingDepth: maxDepth,
            branchBreakdown: breakdown,
            riskLevel
        };
    }
}
