/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const opn = require('opn');
const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const createReport = require('istanbul-reports').create;

const packageFolderNames = ['web', 'store', 'rest-client', 'rtd-client', 'utils'];

const promisifiedExec = async ({ command, options, callback }) =>
  new Promise(resolve => {
    child_process.exec(command, { ...options }, (error, stdout, stderr) => {
      if (!callback) {
        resolve();
      } else {
        const result = callback(error, stdout, stderr);
        resolve(result);
      }
    });
  });

const main = async () => {
  console.log('Generating test coverage report for selected packages...');

  // 0.Clean all coverage folders
  fs.rmdirSync(path.resolve(__dirname, '../coverage'), { recursive: true });
  packageFolderNames.forEach(packageName =>
    fs.rmdirSync(path.resolve(__dirname, `../packages/${packageName}/coverage`), { recursive: true })
  );

  // 1.Scan packages and run tests for all of them.

  const collectCoverageFrom = [
    './src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/scripts/**',
    '!**/dist/**',
    '!**/__tests__/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/.storybook/**',
  ];

  await Promise.all(
    packageFolderNames.map(packageName => {
      console.log('\x1b[36m%s\x1b[0m', `- Running jest and generate report for <${packageName}>`);
      return promisifiedExec({
        command: `cd ${path.resolve(
          __dirname,
          `../packages/${packageName}`
        )}; yarn test --json --outputFile=./coverage/jest-results.json --watchAll=false --verbose=false --silent=true --collectCoverage ${`--collectCoverageFrom=${collectCoverageFrom.join(
          ' --collectCoverageFrom='
        )}`}`,
        options: { maxBuffer: 1024 * 5000 },
      });
    })
  );
  console.log('\x1b[32m%s\x1b[0m', 'Testing finished.');

  // 2. Generate json summary for each package
  await Promise.all(
    packageFolderNames.map(packageName => {
      console.log('\x1b[36m%s\x1b[0m', `- Collecting testing result from <${packageName}>`);
      return promisifiedExec({
        command: `cd ${path.resolve(
          __dirname,
          `../packages/${packageName}`
        )}; yarn istanbul report --include ./coverage/coverage-final.json --dir coverage json-summary`,
      });
    })
  );
  console.log('\x1b[32m%s\x1b[0m', 'Testing results collected.');
  // 3. Generate overall reports

  async function generateMonorepoReport() {
    console.log('\x1b[36m%s\x1b[0m', '- Generating a single monorepo coverage report ...');
    const reportTitle = 'Spaceweb Coverage Report';
    const projects = packageFolderNames.map(folderName => {
      const absolutePath = path.resolve(__dirname, `../packages/${folderName}`);
      const packageName = JSON.parse(fs.readFileSync(`${absolutePath}/package.json`)).name;
      return {
        name: packageName,
        absolutePath,
        path: folderName,
      };
    });

    const coverageMap = createCoverageMap({});
    projects.forEach(project => {
      try {
        const coverageData = JSON.parse(fs.readFileSync(`${project.absolutePath}/coverage/coverage-final.json`));

        coverageMap.merge(coverageData);
      } catch (err) {
        // no coverage report found, which means there is no test. keep silent
        // console.error(err);
      }
    });

    const context = createContext({
      dir: 'coverage',
      coverageMap,
    });

    const htmlReport = createReport('istanbul-reporter-html-monorepo', {
      reportTitle,
      projects,
      defaultProjectName: false,
    });
    htmlReport.execute(context);
  }

  await generateMonorepoReport();
  console.log('\x1b[32m%s\x1b[0m', 'Monorepo testing coverage report generated.');
  // 4. Add no-test packages into the coverage report

  async function getCoverageSummaries() {
    const overallSummary = [];
    packageFolderNames.forEach(folderName => {
      const absolutePath = path.resolve(__dirname, `../packages/${folderName}`);
      const packageName = JSON.parse(fs.readFileSync(`${absolutePath}/package.json`)).name;
      try {
        const currentSummaryReportPath = `${absolutePath}/coverage/coverage-summary.json`;
        const currentJestReportPath = `${absolutePath}/coverage/jest-results.json`;
        const testData = JSON.parse(fs.readFileSync(currentJestReportPath));
        const coverageData = JSON.parse(fs.readFileSync(currentSummaryReportPath));
        overallSummary.push({
          package: packageName,
          data: {
            ...coverageData.total,
            numTotalTests: testData.numTotalTests,
            numTotalTestSuites: testData.numTotalTestSuites,
            numPassedTests: testData.numPassedTests,
            numPassedTestSuites: testData.numPassedTestSuites,
          },
        });
      } catch (err) {
        // no coverage summary report found
        console.error(err);
        overallSummary.push({
          package: packageName,
          data: undefined,
        });
      }
    });
    return overallSummary;
  }
  console.log('\x1b[36m%s\x1b[0m', '- Enhancing final report html...');
  const summaryJson = await getCoverageSummaries();

  const istanbulReportEnhancer = fs.readFileSync(path.resolve(__dirname, './istanbul-report-enhancer.js'), {
    encoding: 'utf-8',
  });
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../coverage/index.html'), { encoding: 'utf-8' });

  const enhancedHtml = indexHtml.replace(
    /<\/body>/,
    `<script>window.summaryData=${JSON.stringify(summaryJson)};\n${istanbulReportEnhancer}</script></body>`
  );
  fs.writeFileSync(path.resolve(__dirname, '../coverage/index.html'), enhancedHtml, { encoding: 'utf-8' });
  console.log('\x1b[32m%s\x1b[0m', 'Coverage report generated successfully.');

  console.log('\x1b[32m%s\x1b[0m', 'All done! 🎉');
  opn(path.resolve(__dirname, '../coverage/index.html'));
};

main();
