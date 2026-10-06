# Code Complexity & Nesting Analyzer (`ComplexityAnalyzer`)

> A Visual Studio Code extension for real-time static code analysis, cyclomatic complexity estimation, and nesting depth tracking.

## Author Information
* **Student:** Paramonov Boris Alekseevich (Парамонов Борис Алексеевич)
* **Group:** M3104
* **ISU ID:** 558478
* **University:** ITMO University, Saint Petersburg
* **Discipline:** Software Development Tools (Инструментальные средства разработки ПО)
* **Instructor:** Povyshev Vladislav Vyacheslavovich

---

## 1. Overview & Motivation

When writing or reviewing code, excessive branching and deep nesting lead to high cognitive load, reduced maintainability, and higher defect rates. 

**ComplexityAnalyzer** is a lightweight VS Code extension designed to provide instant feedback on code quality directly inside the editor without requiring external heavy linters or build steps.

### Key Features:
* **Cyclomatic Complexity (McCabe metric):** Computes $M = 1 + \sum \text{decision points}$ dynamically.
* **Maximum Nesting Depth:** Tracks hierarchical block nesting level using an explicit Stack data structure.
* **Status Bar Indicator:** Real-time metrics display (`$(graph) CC: X | Depth: Y`) with warning color highlights for high-risk code blocks.
* **Interactive Modal Inspection:** Detailed breakdown of branching constructs (`if`, `for`, `while`, `case`, `catch`, logical operators `&&`, `||`, etc.).
* **Comments & Literals Stripping:** Robust preprocessing that eliminates false positives inside strings, single-line, and multi-line comments.
* **Dual Execution Modes:** Analyze either the selected code snippet or the entire active document.

---

## 2. Architecture & Data Structures

The extension strictly adheres to the laboratory requirements regarding algorithmic logic and the use of fundamental data structures:

```text
┌─────────────────────────────────────────────────────────────┐
│                       VS Code Editor                        │
│   (Active Editor / Selection Change / Command Invocation)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Source Code Snippet
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                CodeComplexityAnalyzer (src/)                │
│                                                             │
│  1. Lexical Preprocessing (strip comments & literals)       │
│  2. Branch Counting via Map<string, number> (McCabe Metric) │
│  3. Nesting Tracking via Stack<BlockFrame>                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ ComplexityReport
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         UI Feedback                         │
│  • Status Bar Item (Color-coded CC & Nesting Depth)         │
│  • Modal Dialog (Breakdown, Risk Category: A / B / C / D)   │
└─────────────────────────────────────────────────────────────┘
```

### Data Structures Employed:
1. **Generic Stack (`Stack<T>`):**
   Used for tracking open and closed braces (`{` and `}`). It ensures balanced block analysis and computes the maximum nesting depth ($O(N)$ time complexity).
2. **Associative Array / Map (`Map<string, number>`):**
   Used as a frequency dictionary to store and aggregate counts of distinct control flow constructs (`if`, `for`, `while`, `case`, `catch`, logical operators).
3. **Structured Report Object (`ComplexityReport`):**
   Encapsulates lines of code (LOC), cyclomatic complexity, max nesting depth, operator breakdown dictionary, and categorical risk rating.

---

## 3. Supported Metrics & Evaluation Scale

| Metric | Threshold (Low) | Threshold (Moderate) | Threshold (High / Critical) |
| :--- | :---: | :---: | :---: |
| **Cyclomatic Complexity ($M$)** | $1 - 5$ (Category A) | $6 - 10$ (Category B) | $> 10$ (Category C / D) |
| **Nesting Depth** | $1 - 3$ | $4$ | $\ge 5$ |

*When complexity exceeds safe thresholds, the Status Bar item dynamically changes background color to alert the developer.*

---

## 4. Extension Commands

The extension contributes the following commands to the VS Code Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

* `Code Complexity: Analyze Selected Code` (`complexityAnalyzer.analyzeSelection`): Evaluates currently highlighted lines or the active file.
* `Code Complexity: Analyze Active File` (`complexityAnalyzer.analyzeFile`): Runs full inspection on the active document.

---

## 5. Getting Started & Development

### Prerequisites
* [Node.js](https://nodejs.org/) (LTS recommended)
* [Visual Studio Code](https://code.visualstudio.com/)

### Installation & Build

1. Clone or open the repository in VS Code:
   ```bash
   cd ComplexityAnalyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile TypeScript sources:
   ```bash
   npm run compile
   ```

### Running and Debugging in VS Code
1. Open the project folder in VS Code.
2. Press **`F5`** (or go to `Run -> Start Debugging`).
3. A new window titled `[Extension Development Host]` will open.
4. Open any source file (`.js`, `.ts`, `.c`, `.java`, `.py`, etc.).
5. Observe the metrics in the bottom-right Status Bar and click the item for the detailed breakdown report.

---

## 6. Generating Documentation

The project includes inline JSDoc/TypeDoc comments for all public classes, methods, and interfaces.

To generate HTML documentation pages:
```bash
npx typedoc --out docs src/analyzer.ts
```
The output documentation will be saved in the `docs/` directory.

---

## 7. License

Distributed under the MIT License. Developed for academic purposes at ITMO University (2026).
