import * as vscode from 'vscode';
import { CodeComplexityAnalyzer, ComplexityReport } from './analyzer';

let statusBarItem: vscode.StatusBarItem;
const analyzer = new CodeComplexityAnalyzer();

/**
 * Extension activation callback.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('ComplexityAnalyzer extension is now active.');

    // 1. Create status bar indicator
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'complexityAnalyzer.analyzeSelection';
    context.subscriptions.push(statusBarItem);

    // 2. Subscribe to editor and selection changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateStatusBar),
        vscode.window.onDidChangeTextEditorSelection(updateStatusBar)
    );

    // 3. Command: Analyze selected code (or whole file if no selection)
    const analyzeSelectionCmd = vscode.commands.registerCommand(
        'complexityAnalyzer.analyzeSelection',
        () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('Откройте файл для анализа.');
                return;
            }

            const selection = editor.selection;
            const text = editor.document.getText(selection.isEmpty ? undefined : selection);

            if (!text.trim()) {
                vscode.window.showWarningMessage('Выделите код для расчета сложности.');
                return;
            }

            const report = analyzer.analyze(text);
            showDetailedReport(report, selection.isEmpty ? 'Всему файлу' : 'Выделенному фрагменту');
        }
    );

    // 4. Command: Analyze full active document
    const analyzeFileCmd = vscode.commands.registerCommand(
        'complexityAnalyzer.analyzeFile',
        () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('Откройте файл для анализа.');
                return;
            }

            const text = editor.document.getText();
            const report = analyzer.analyze(text);
            showDetailedReport(report, 'Текущему файлу');
        }
    );

    context.subscriptions.push(analyzeSelectionCmd, analyzeFileCmd);

    // Initial status bar update
    updateStatusBar();
}

/**
 * Updates status bar widget text and background highlight.
 */
function updateStatusBar(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        statusBarItem.hide();
        return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection.isEmpty ? undefined : selection);

    if (!text.trim()) {
        statusBarItem.text = `$(graph) Complexity: -`;
        statusBarItem.tooltip = 'Выделите код для анализа сложности';
        statusBarItem.show();
        return;
    }

    const report = analyzer.analyze(text);
    const scope = selection.isEmpty ? 'Файл' : 'Выделение';

    statusBarItem.text = `$(graph) CC: ${report.cyclomaticComplexity} | Depth: ${report.maxNestingDepth}`;
    statusBarItem.tooltip = `[${scope}] Сложность: ${report.cyclomaticComplexity}, Глубина: ${report.maxNestingDepth}, Риск: ${report.riskLevel}. Кликните для отчета.`;

    if (report.cyclomaticComplexity > 10 || report.maxNestingDepth > 4) {
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
        statusBarItem.backgroundColor = undefined;
    }

    statusBarItem.show();
}

/**
 * Displays detailed inspection modal dialog with breakdown of metrics.
 */
function showDetailedReport(report: ComplexityReport, target: string): void {
    const breakdown = Object.entries(report.branchBreakdown)
        .map(([k, v]) => `  • ${k}: ${v}`)
        .join('\n');

    const details = [
        `Отчет по сложности (${target}):`,
        `─────────────────────────────`,
        `• Строк кода: ${report.linesOfCode}`,
        `• Цикломатическая сложность: ${report.cyclomaticComplexity}`,
        `• Макс. глубина вложенности: ${report.maxNestingDepth}`,
        `• Оценка риска: ${report.riskLevel}`,
        ``,
        `Точки ветвления:`,
        breakdown || '  (Нет ветвлений)'
    ].join('\n');

    vscode.window.showInformationMessage(
        `Сложность: ${report.cyclomaticComplexity} | Вложенность: ${report.maxNestingDepth} (${report.riskLevel})`,
        { modal: true, detail: details }
    );
}

/**
 * Extension deactivation callback.
 */
export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
