import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { ManageTestsComponent } from './manage-tests.component';
import { ChooseTestComponent } from './choose-test.component';
import { ScheduleTestComponent } from './schedule-test.component';
import { SharedDeactivateGuard } from '../../guards/shared.deactivate.guard';
import { ConfirmationComponent } from './confirmation.component';
import { ViewTestComponent } from './view-test.component';
import { LastTestingSessionComponent } from './last-testing-session.component';
import { ConfirmationModifyInProgressComponent } from './confirmation-modify-in-progress.component';
import { AddStudentsComponent } from './add-students.component';
import { ReviewTestComponent } from './review-test.component';

const testsRoutes: Routes = [
    { path: 'tests', component: ManageTestsComponent, pathMatch: "full" },
    { path: 'tests/choose-test/:institutionId', component: ChooseTestComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/schedule-test', component: ScheduleTestComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/add-students', component: AddStudentsComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/review', component: ReviewTestComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/confirmation', component: ConfirmationComponent },
    { path: 'tests/view/:id', component: ViewTestComponent },
    { path: 'tests/:action/choose-test/:institutionId', component: ChooseTestComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/:action/schedule-test', component: ScheduleTestComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/:action/add-students', component: AddStudentsComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/:action/review', component: ReviewTestComponent, canDeactivate: [SharedDeactivateGuard] },
    { path: 'tests/:action/view/:id', component: ViewTestComponent },
    { path: 'tests/:action/confirmation', component: ConfirmationComponent },
    { path: 'tests/testing-session-expired', component: LastTestingSessionComponent },
    { path: 'tests/confirmation-modify-in-progress', component: ConfirmationModifyInProgressComponent }
]


@NgModule({
    imports: [
        RouterModule.forChild(testsRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class TestsRoutingModule { }
