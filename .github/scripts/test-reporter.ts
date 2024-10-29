// test-reporter.ts
import fs from "fs";
import path from "path";

interface AssertionResult {
  ancestorTitles: string[];
  duration: number;
  failureDetails: any[];
  failureMessages: string[];
  fullName: string;
  invocations: number;
  location: { line: number; column: number } | null;
  numPassingAsserts: number;
  retryReasons: string[];
  status: "passed" | "failed" | "pending" | "todo";
  title: string;
}

interface TestResult {
  assertionResults: AssertionResult[];
  endTime: number;
  message: string;
  name: string;
  startTime: number;
  status: "passed" | "failed";
  summary: string;
}

interface SnapshotData {
  added: number;
  didUpdate: boolean;
  failure: boolean;
  filesAdded: number;
  filesRemoved: number;
  filesRemovedList: string[];
  filesUnmatched: number;
  filesUpdated: number;
  matched: number;
  total: number;
  unchecked: number;
  uncheckedKeysByFile: string[];
  unmatched: number;
  updated: number;
}

interface JestResults {
  numFailedTestSuites: number;
  numFailedTests: number;
  numPassedTestSuites: number;
  numPassedTests: number;
  numPendingTestSuites: number;
  numPendingTests: number;
  numRuntimeErrorTestSuites: number;
  numTodoTests: number;
  numTotalTestSuites: number;
  numTotalTests: number;
  openHandles: any[];
  snapshot: SnapshotData;
  startTime: number;
  success: boolean;
  testResults: TestResult[];
}

interface TestSummary {
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  totalTests: number;
  numTestSuites: number;
  failedTestDetails: {
    title: string;
    location: string;
    error: string;
  }[];
  duration: number;
  snapshotData: SnapshotData;
}

function generateTestSummary(resultsFile: string): TestSummary {
  const results: JestResults = JSON.parse(fs.readFileSync(resultsFile, "utf8"));

  const summary: TestSummary = {
    numPassedTests: results.numPassedTests,
    numFailedTests: results.numFailedTests,
    numPendingTests: results.numPendingTests,
    numTodoTests: results.numTodoTests,
    totalTests: results.numTotalTests,
    numTestSuites: results.numTotalTestSuites,
    failedTestDetails: [],
    duration: 0,
    snapshotData: results.snapshot,
  };

  // Calculate total duration and collect failed test details
  results.testResults.forEach((suite) => {
    const suiteDuration = suite.endTime - suite.startTime;
    summary.duration += suiteDuration;

    // Collect details of failed tests
    suite.assertionResults
      .filter((test) => test.status === "failed")
      .forEach((test) => {
        const testPath =
          test.ancestorTitles.length > 0
            ? `${test.ancestorTitles.join(" → ")} → ${test.title}`
            : test.title;

        summary.failedTestDetails.push({
          title: testPath,
          location: `${suite.name}${
            test.location ? `:${test.location.line}` : ""
          }`,
          error: test.failureMessages[0] || "No error message provided",
        });
      });
  });

  return summary;
}

function createMarkdownSummary(summary: TestSummary): string {
  const passRate = (
    (summary.numPassedTests / summary.totalTests) *
    100
  ).toFixed(2);
  const duration = (summary.duration / 1000).toFixed(2);

  let markdown = `## Jest Summary\n\n`;

  // Status badge
  const status = summary.numFailedTests === 0 ? "✅ PASSED" : "❌ FAILED";
  markdown += `### Status: ${status}\n\n`;

  // Create both tables with HTML layout
  markdown += '<table><tr><td width="50%" valign="top">\n\n';

  // Test Summary table
  markdown += `| Metric | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Test Suites | ${summary.numTestSuites} |\n`;
  markdown += `| Total Tests | ${summary.totalTests} |\n`;
  markdown += `| Passed | ${summary.numPassedTests} |\n`;
  markdown += `| Failed | ${summary.numFailedTests} |\n`;
  markdown += `| Pending | ${summary.numPendingTests} |\n`;
  markdown += `| Todo | ${summary.numTodoTests} |\n`;
  markdown += `| Pass Rate | ${passRate}% |\n`;
  markdown += `| Duration | ${duration}s |\n\n`;

  markdown += '</td><td width="50%" valign="top">\n\n';

  // Snapshot summary
  if (summary.snapshotData.total > 0) {
    markdown += `| Metric | Count |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total | ${summary.snapshotData.total} |\n`;
    markdown += `| Matched | ${summary.snapshotData.matched} |\n`;
    markdown += `| Updated | ${summary.snapshotData.updated} |\n`;
    markdown += `| Added | ${summary.snapshotData.added} |\n`;
    markdown += `| Removed | ${summary.snapshotData.filesRemoved} |\n\n`;
  } else {
    markdown += "*No snapshots in this test run*\n\n";
  }

  markdown += "</td></tr></table>\n\n";

  // Failed tests details
  if (summary.failedTestDetails.length > 0) {
    markdown += `### Failed Tests\n\n`;
    summary.failedTestDetails.forEach((failure) => {
      markdown += `<details>\n`;
      markdown += `<summary>❌ ${failure.title}</summary>\n\n`;
      markdown += `**Location:** ${failure.location}\n\n`;
      markdown += `\`\`\`\n${failure.error}\n\`\`\`\n`;
      markdown += `</details>\n\n`;
    });
  }

  return markdown;
}

// Main execution
const args = process.argv.slice(2);
const resultsFile = args[0];

if (!resultsFile) {
  console.error("Please provide the path to jest results json file");
  process.exit(1);
}

try {
  const summary = generateTestSummary(resultsFile);
  const markdown = createMarkdownSummary(summary);

  // Write to GITHUB_STEP_SUMMARY if running in GitHub Actions
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  } else {
    console.log(markdown);
  }
} catch (error) {
  console.error(
    "Error processing test results:",
    error instanceof Error ? error.message : "Unknown error"
  );

  process.exit(1);
}
