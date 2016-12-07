import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { RostersComponent }   from './rosters.component';
import { RostersCohortsComponent } from './rosters-cohorts.component';
import { RostersHeaderComponent } from './rosters-header.component';
import { RostersFaqComponent } from './rosters-faq.component';
import { RostersMultiCampusComponent } from './rosters-multicampus.component';
import { RostersSearchComponent } from './rosters-search.component';
import { RosterService } from './roster.service';
import { PageModule } from './../shared/page.module';
import { RostersModal } from './../../models/rosters.model';
import { RosterCohortsModel } from './../../models/roster-cohorts.model';
import { RosterCohortStudentsModel } from './../../models/roster-cohort-students.model';
import { HttpModule } from '@angular/http';
import { PipesModule } from './../../pipes/pipes.module';
import { RostersRoutingModule } from './rosters.routing.module';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { ProfileService } from '../home/profile.service';
import { RostersAMInfoComponent } from './rosters-AM-info.component';
import { RostersChangeHeaderComponent } from './rosters-change-extend-header.component';
import { RosterChangesService } from './roster-changes.service';
import { RosterChangeNoteComponent } from './roster-change-note.component';
import { RostersChangesUpdatesComponent } from './rosters-changes-updates.component';
import { RostersChangeUpdateFormComponent } from './rosters-change-update-form.component';
import { RostersNoAMComponent } from './rosters-no-AM.component';
import {RequestChangeRosterPopupComponent} from './request-change-roster-popup.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        PageModule,
        PipesModule,
        RostersRoutingModule
    ],
    exports: [],
    declarations: [
        RostersComponent,
        RostersCohortsComponent,
        RostersHeaderComponent,
        RostersFaqComponent,
        RostersMultiCampusComponent,
        RostersSearchComponent,
        RostersAMInfoComponent,
        RostersChangeHeaderComponent,
        RosterChangeNoteComponent,
        RostersChangesUpdatesComponent,
        RostersChangeUpdateFormComponent,
        RostersNoAMComponent,
        RequestChangeRosterPopupComponent
    ],
    providers: [
        RosterService,
        ProfileService,
        RostersModal,
        RosterCohortsModel,
        RosterCohortStudentsModel,
        RosterChangesModel,
        RosterChangesService

    ],
})
export class RostersModule { }
