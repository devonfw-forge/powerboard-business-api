
//****************************************************** */
const scanner = require('sonarqube-scanner');
import * as dotenv from 'dotenv';
const path = require('path');
dotenv.config({ path: path.resolve('src/.env') });
scanner(
  {
    // this uses local instance of SQ
    serverUrl: 'http://localhost:9000/',
    options: {
      'sonar.projectVersion': '1.1.0',
      //"sonar.sources": "src",
      // "sonar.inclusions": 'src/**',
      //'sonar.tests': "src",
      //"sonar.exclusions": "**/*.js,dist",
      // "sonar.test.inclusions": "**/*test*",
      'sonar.language': 'ts',
      // "sonar.test.inclusions": "src/**/*.spec.ts",
      'sonar.login': process.env.SONAR_LOGIN,
      'sonar.password': process.env.SONAR_PASSWORD,
      // "sonar.javacript.lcov.reportPaths": "coverage/lcov.info",
      // "sonar.testExecutionReportPaths": "coverage/clover.xml",
      'sonar.sourceEncoding': 'UTF-8',
      'sonar.sources': 'src',
      'sonar.exclusions': 'src/migration/**.ts',
      'sonar.tests': 'src',
      //"sonar.inclusions":"src",
      'sonar.test.inclusions': '**/*.spec.ts',
      'sonar.typescript.coveragePlugin': 'lcov',
      'sonar.coverage.exclusions':
        'src/app/shared/**/*.ts,src/config/**.ts,src/migration/**.ts,src/main.ts,src/app/visibility/**/**.ts,src/app/core/core.module.ts,src/app/core/auth/decorators/get-user.decorator.ts,src/sonar-scanner.ts',
      'sonar.testExecutionReportPaths': 'test-report.xml',
      //"**/main.ts", "**/config/*", "**/migration/*", "**/*.module.ts",
      // "sonar.clover.reportPath": "coverage/clover.xml",
      //"sonar.junit.reportsPath": "coverage/lcov.info",
      // "sonar.testExecutionReportPaths": "coverage/clover.xml",
      //"sonar.typescript.lcov.reportPaths": "./coverage/lcov.info",

      //"sonar.typescript.lcov.reportPaths": "src/reports/jest-coverage/unit",
      // "sonar.javascript.lcov.reportPaths": "coverage/lcov.info"
      //"sonar.ts.coverage.lcovReportPath": "lcov.info"
    },
  },
  () => {
    // callback is required
  },
);
//**************************************** */

