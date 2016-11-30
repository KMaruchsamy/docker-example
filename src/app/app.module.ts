import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';

import { AuthService } from './services/auth.service';
import { CommonService } from './services/common.service';
import { LogService } from './services/log.service';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';
import { LoginModule } from './components/login/login.module';
import { ControlsModule } from './components/controls/controls.module';
import { PipesModule } from './pipes/pipes.module';
import { ErrorModule } from './components/errors/errors.module';
import { UtilityService } from './services/utility.service';
import { ValidationsService } from './services/validations.service';
import { SharedDeactivateGuard } from './guards/shared.deactivate.guard';
import { MyExceptionHandler } from './scripts/myexception-handler';
import { SelectedStudentModel } from './models/selected-student.model';
import { TestScheduleModel } from './models/test-schedule.model';
import { TestStartedExceptionModal } from './models/test-started-exceptions.model';
import { TestsModal } from './models/tests.model';
import { TimingExceptionsModal } from './models/timing-exceptions.model';
import { TestService } from './components/tests/test.service';
import { HomeModule } from './components/home/home.module';
import { HelpModule } from './components/help/help.module';
import { AccountModule } from './components/account/account.module';
import { RostersModule } from './components/rosters/rosters.module';
import { ReportsModule } from './components/reports/reports.module';
import { GroupsModule } from './components/groups/groups.module';
import { ForgotPasswordModule } from './components/forgot-password/forgot-password.module';
import { ResetPasswordModule } from './components/reset-password/reset-password.module';
import { TestsModule } from './components/tests/tests.module';
import { UserGuideModule } from './components/userguide/userguide.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LoginModule,
    HomeModule,
    HelpModule,
    AccountModule,
    RostersModule,
    ReportsModule,
    GroupsModule,
    ForgotPasswordModule,
    ResetPasswordModule,
    TestsModule,
    UserGuideModule,
    AppRoutingModule,
    Angulartics2Module.forRoot(),
    ErrorModule,
    ControlsModule,
    PipesModule
  ],
  providers: [
    Angulartics2GoogleAnalytics,
    LogService,
    AuthService,
    Title,
    CommonService,
    LogService,
    UtilityService,
    ValidationsService,
    SharedDeactivateGuard,
    { provide: ErrorHandler, useClass: MyExceptionHandler },
    TestService,
    SelectedStudentModel,
    TestScheduleModel,
    TestStartedExceptionModal,
    TestsModal,
    TimingExceptionsModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
