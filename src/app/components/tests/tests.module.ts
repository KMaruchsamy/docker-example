import { NgModule } from '@angular/core';
import { ManageTestsComponent } from './manage-tests.component';
import { AddStudentsComponent } from './add-students.component';
import { ChooseTestComponent } from './choose-test.component';
import { ConfirmationModifyInProgressComponent } from './confirmation-modify-in-progress.component';
import { ConfirmationComponent } from './confirmation.component';
import { LastTestingSessionComponent } from './last-testing-session.component';
import { RetesterAlternatePopupComponent } from './retesters-alternate-popup.component';
import { RetesterNoAlternatePopupComponent } from './retesters-noalternate-popup.component';
import { ReviewTestComponent } from './review-test.component';
import { ScheduleTestComponent } from './schedule-test.component';
import { SelfPayStudentPopupComponent } from './self-pay-student-popup.component';
import { StudentsStartedTestComponent } from './students-started-test.popup.component';
import { TestHeaderComponent } from './test-header.component';
import { TestingSessionStartingPopupComponent } from './test-starting-popup.component';
import { TimeExceptionPopupComponent } from './time-exception-popup.component';
import { ViewTestComponent } from './view-test.component';
// import { SelectedStudentModel } from './../../models/selected-student.model';
// import { TestScheduleModel } from './../../models/test-schedule.model';
// import { TestStartedExceptionModal } from './../../models/test-started-exceptions.model';
// import { TestsModal } from './../../models/tests.model';
// import { TimingExceptionsModal } from './../../models/timing-exceptions.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageModule } from './../shared/page.module';
import { SharedModule } from './../shared/shared.module';
import { PipesModule } from './../../pipes/pipes.module';
import { TestsRoutingModule } from './tests.routing.module';
import { TestScheduleModel } from '../../models/test-schedule.model';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        PageModule,
        SharedModule,
        PipesModule,
        TestsRoutingModule
    ],
    exports: [],
    declarations: [
        ManageTestsComponent,
        AddStudentsComponent,
        ChooseTestComponent,
        ConfirmationModifyInProgressComponent,
        ConfirmationComponent,
        LastTestingSessionComponent,
        RetesterAlternatePopupComponent,
        RetesterNoAlternatePopupComponent,
        ReviewTestComponent,
        ScheduleTestComponent,
        SelfPayStudentPopupComponent,
        StudentsStartedTestComponent,
        TestHeaderComponent,
        TestingSessionStartingPopupComponent,
        TimeExceptionPopupComponent,
        ViewTestComponent
    ],
    providers: [
        TestScheduleModel
    ]
})
export class TestsModule { }
