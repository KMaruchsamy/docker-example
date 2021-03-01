import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RostersComponent } from './rosters.component';
import { RosterChangeNoteComponent } from './roster-change-note.component';
import { RostersChangesUpdatesComponent } from './rosters-changes-updates.component';
import { RostersNoAMComponent } from './rosters-no-AM.component';
import { RosterChangesSummaryComponent } from './rosters-changes-summary.component';
// import { RostersExtendAccessComponent } from './rosters-extend-access.component';
import { RosterRequestsConfirmation } from './roster-changes-confirmation.component';
import { SharedDeactivateGuard } from '../../guards/shared.deactivate.guard';
import { AuthorizeGuard } from './../../guards/AuthorizeGuard.service';

const rostersRoutes: Routes = [
    { path: 'rosters', component: RostersComponent, canActivate: [AuthorizeGuard], pathMatch: 'full' },
    { path: 'rosters/changes-note', component: RosterChangeNoteComponent, canActivate: [AuthorizeGuard] },
    { path: 'rosters/change-update', component: RostersChangesUpdatesComponent, canActivate: [AuthorizeGuard], canDeactivate:[SharedDeactivateGuard] },
    { path: 'rosters/no-account-manager', component: RostersNoAMComponent, canActivate: [AuthorizeGuard] },
    { path: 'rosters/roster-changes-summary', component: RosterChangesSummaryComponent, canActivate: [AuthorizeGuard],  canDeactivate:[SharedDeactivateGuard] },
    // { path: 'rosters/extend-access', component: RostersExtendAccessComponent,  canDeactivate:[SharedDeactivateGuard] },
    { path: 'rosters/confirmation', component: RosterRequestsConfirmation, canActivate: [AuthorizeGuard] }
]

@NgModule({
    imports: [
        RouterModule.forChild(rostersRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class RostersRoutingModule { }
