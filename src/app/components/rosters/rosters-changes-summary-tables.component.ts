import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, NavigationStart } from '@angular/router';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';

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
    extendAccessStudents: Array<any>;
    hasActionMoved: boolean;
    hasActionAdded: boolean;

    constructor(public router: Router, private common: CommonService, public rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        this.rosterChangesModel = this.rosterChangesService.getUpdatedRosterChangesModel();
        this.findMovedFromThisCohortStudents();
        this.findMovedToThisCohortStudents();
        this.findAddedStudents();
        this.findActions();
        this.findExtendAccessStudents();
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

    findExtendAccessStudents(): void {
        this.extendAccessStudents =  _.filter(this.rosterChangesModel.students, ['updateType', RosterUpdateTypes.ExtendAccess ]);
    }

    checkPrevRoute(): void {
        if(this.extendAccessStudents.length > 0) {
            this.router.navigate(['/rosters/extend-access']);
        } else {
            this.router.navigate(['/rosters/change-update']);
        }
    }

    findActions(): void {
        let movedHasRepeaters = _.filter(this.movedToStudents, ['isRepeater', true]);
        let movedHasUntimedTests = _.filter(this.movedToStudents, ['isGrantUntimedTest', true]);
        this.hasActionMoved = ( movedHasRepeaters.length > 0 || movedHasUntimedTests.length > 0 );

        let addedHasRepeaters = _.filter(this.addedStudents, ['isRepeater', true]);
        let addedHasUntimedTests = _.filter(this.addedStudents, ['isGrantUntimedTest', true]);
        this.hasActionAdded = ( addedHasRepeaters.length > 0 || addedHasUntimedTests.length > 0 );
    }


}
