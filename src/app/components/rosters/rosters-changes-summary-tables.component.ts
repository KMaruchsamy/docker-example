import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart } from '@angular/router';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';

import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import * as _ from 'lodash';
import { RosterUpdateTypes } from '../../constants/config';

@Component({
    selector: 'rosters-changes-summary-tables',
    templateUrl: './rosters-changes-summary-tables.component.html',
    styles: [`td span {display: block;}  
              table tr td {vertical-align: top;}`]
})

export class RosterChangesSummaryTablesComponent implements OnInit {
    sStorage: any;
    changedStudents: Array<any>;
    movedToStudents: Array<any>;
    addedStudents: Array<any>;

    constructor(public auth: AuthService, public router: Router, private common: CommonService, private rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.rosterChangesModel = this.rosterChangesService.getUpdatedRosterChangesModel();
            this.findMovedFromThisCohortStudents();
            this.findMovedToThisCohortStudents();
            this.findAddedStudents();
        }
    }

    findMovedFromThisCohortStudents(): void {
        this.changedStudents =  _.filter(this.rosterChangesModel.students, ['updateType', RosterUpdateTypes.MoveToDifferentCohort ]);
    }

    findMovedToThisCohortStudents(): void {
        this.movedToStudents =  _.filter(this.rosterChangesModel.students, ['updateType', RosterUpdateTypes.MoveToThisCohort]);
    }

    findAddedStudents(): void {
        this.addedStudents =  _.filter(this.rosterChangesModel.students, ['updateType', RosterUpdateTypes.AddToThisCohort]);
    }


}
