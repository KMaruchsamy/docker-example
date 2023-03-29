# Clilatest

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deployment configuration

- On ready to deploy to QA/PROD, merge all the changes from dev to qa branch
- Checkout the qa branch, run the following command:  
 `npm version [patch|minor|major]` - to update the package json and tagging the release  
 **Note: The dev branch will not have the latest build version in the package.json file**

- On successful tagging the release, run the jenkins job: [Nursing-QA - NIT-UX-QA - Build-NIT-UX](https://jenkins.kaptest.com/view/Licensure/job/Nursing-QA/job/NIT-UX-QA/job/Build-NIT-UX/build?delay=0sec) with `APP_VERSION` parameter as the latest tag

- On sucessful build, for QA deploy run the jenkins job:  [Nursing-QA - NIT-UX-QA - Deploy-NIT-UX](https://jenkins.kaptest.com/view/Licensure/job/Nursing-QA/job/NIT-UX-QA/job/Deploy-NIT-UX/build?delay=0sec) with the same `APP_VERSION` parameter used for build job

- PROD deploy run the jenkins job: [Nursing-PRD - NIT-UX-PRD - Deploy](https://jenkins.kaptest.com/view/Licensure/job/Nursing-PRD/job/NIT-UX-PRD/job/deploy/build?delay=0sec) with the same `APP_VERSION` parameter used for build job

- On successful release merge the qa branch into the master branch

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
