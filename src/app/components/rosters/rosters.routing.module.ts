import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RostersComponent } from './rosters.component';
import { RosterChangeNoteComponent } from './roster-change-note.component';
import { RostersChangesUpdatesComponent } from './rosters-changes-updates.component';
import { SharedDeactivateGuard } from '../../guards/shared.deactivate.guard';

const rostersRoutes: Routes = [
    { path: 'rosters', component: RostersComponent, pathMatch: 'full' },
    { path: 'rosters/changes-note', component: RosterChangeNoteComponent },
    { path: 'rosters/change-update', component: RostersChangesUpdatesComponent, canDeactivate:[SharedDeactivateGuard] },
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
