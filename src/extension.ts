import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  let runLocalTest = vscode.commands.registerCommand('extension.runLocalTest', () => {
    vscode.window.showInformationMessage('Running Local Test...');
    // Add your local test logic here
  });

  let submitAssessment = vscode.commands.registerCommand('extension.submitAssessment', async () => {
    try {
      // Save all files
      await vscode.workspace.saveAll(false);

      // Commit changes
      const repoPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!repoPath) {
        throw new Error('No workspace folder found.');
      }

      const gitCommitCommand = `git -C "${repoPath}" commit -am "Assessment submission"`;
      exec(gitCommitCommand, (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(`Commit failed: ${stderr}`);
          return;
        }

        // Push changes
        const pat = fs.readFileSync(path.join(repoPath, 'pat.txt'), 'utf8').trim();
        const originUrl = fs.readFileSync(path.join(repoPath, 'origin.txt'), 'utf8').trim();
        const gitPushCommand = `git -C "${repoPath}" push https://${pat}@${originUrl}`;

        exec(gitPushCommand, (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(`Push failed: ${stderr}`);
            return;
          }

          vscode.window.showInformationMessage('Assessment submitted successfully!');
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      } else {
        vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      }
    }
  });

  context.subscriptions.push(runLocalTest, submitAssessment);
}

export function deactivate() {}