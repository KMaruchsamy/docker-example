import { Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Title} from '@angular/platform-browser';
import * as _ from 'lodash';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { PageFooterComponent } from './../shared/page-footer.component';
import { RostersAMInfoComponent } from './rosters-AM-info.component';
import { RostersChangeHeaderComponent } from './rosters-change-extend-header.component';

import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';


@Component({
    selector: 'rosters-changes-updates',
    templateUrl: './rosters-changes-updates.component.html'
})

export class RostersChangesUpdatesComponent implements OnInit {
    constructor(public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, private rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.rosterChangesModel = this.rosterChangesService.getRosterChangesModel();
            this.titleService.setTitle('Request Roster Changes – Kaplan Nursing');
        }  
    }

}
