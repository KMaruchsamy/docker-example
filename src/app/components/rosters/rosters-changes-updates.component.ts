import { Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Title} from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';



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
