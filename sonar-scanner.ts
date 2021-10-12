//import * as scanner from 'sonarqube-scanner';
// const scanner = require('sonarqube-scanner')
// import { config as configDotenv } from 'dotenv';

// // config the environment
// configDotenv();

// // The URL of the SonarQube server. Defaults to http://localhost:9000
// const serverUrl = process.env.SONARQUBE_URL;

// // The token used to connect to the SonarQube/SonarCloud server. Empty by default.
// const token = process.env.SONARQUBE_TOKEN;

// // projectKey must be unique in a given SonarQube instance
// const projectKey = process.env.SONARQUBE_PROJECTKEY

// // options Map (optional) Used to pass extra parameters for the analysis.
// // See the [official documentation](https://docs.sonarqube.org/latest/analysis/analysis-parameters/) for more details.
// const options = {

//     'sonar.projectKey': projectKey,

//     // projectName - defaults to project key
//     'sonar.projectName': 'node-typescript-boilerplate',

//     // Path is relative to the sonar-project.properties file. Defaults to .
//     'sonar.sources': 'src',

//     // source language
//     'sonar.language': 'ts',

//     'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',

//     // Encoding of the source code. Default is default system encoding
//     'sonar.sourceEncoding': 'UTF-8'
// };

// // parameters for sonarqube-scanner
// const params = {
//     serverUrl,
//     token,
//     options
// }

// const sonarScanner = async () => {

//     console.log(serverUrl);

//     if (!serverUrl) {
//         console.log('SonarQube url not set. Nothing to do...');
//         return;
//     }

//     //  Function Callback (the execution of the analysis is asynchronous).
//     const callback = (result: any) => {
//         console.log('Sonarqube scanner result:', result);
//     }

//     scanner(params, callback);
// }

// sonarScanner()
//     .catch(err => console.error('Error during sonar scan', err));

const scanner = require('sonarqube-scanner');
import * as dotenv from 'dotenv';
dotenv.config();
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
            'sonar.login': '',
            'sonar.password': '',
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
                'src/app/shared/**/*.ts,src/config/**.ts,src/migration/**.ts,src/main.ts,src/app/visibility/**/**.ts,src/app/core/core.module.ts,src/app/core/auth/decorators/get-user.decorator.ts',
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

// const sonarqubeScanner = require('sonarqube-scanner');

// sonarqubeScanner({
//     serverUrl: 'http://sonarqube.fosstechnix.info/',
//     options: {
//         'sonar.sources': '.',
//         'sonar.inclusions': 'src/**'
//     },
// }, () => { });
