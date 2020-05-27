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

const rostersRoutes: Routes = [
    { path: 'rosters', component: RostersComponent, pathMatch: 'full' },
    { path: 'rosters/changes-note', component: RosterChangeNoteComponent },
    { path: 'rosters/change-update', component: RostersChangesUpdatesComponent, canDeactivate:[SharedDeactivateGuard] },
    { path: 'rosters/no-account-manager', component: RostersNoAMComponent },
    { path: 'rosters/roster-changes-summary', component: RosterChangesSummaryComponent,  canDeactivate:[SharedDeactivateGuard] },
    // { path: 'rosters/extend-access', component: RostersExtendAccessComponent,  canDeactivate:[SharedDeactivateGuard] },
    { path: 'rosters/confirmation', component: RosterRequestsConfirmation }
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
