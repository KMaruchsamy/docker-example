import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';
import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import { RosterChangesSummaryTablesComponent } from './rosters-changes-summary-tables.component';

@Component({
    selector: 'roster-changes-confirmation',
    styles: [ `     
    @media print {
       html {
         font-size: 75%;
       }
     }`
    ],
    templateUrl: './roster-changes-confirmation.component.html'
})

export class RosterRequestsConfirmation implements OnInit {
    sStorage: any;
    submittedDate: Date;

    constructor(public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, private rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.rosterChangesModel = this.rosterChangesService.getUpdatedRosterChangesModel();
            this.titleService.setTitle('Roster Change Request Confirmation – Kaplan Nursing');
            this.submittedDate = new Date();
            window.scroll(0, 0);
        }
    }

    print(): void {
        window.print();
    }
}
