import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { CommonService } from './../../services/common.service';



import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { RosterChangesService } from './roster-changes.service';
import { ChangeUpdateRosterStudentsModal } from '../../models/change-update-roster-students.model';
import * as _ from 'lodash';

@Component({
    selector: 'rosters-changes-updates',
    templateUrl: './rosters-changes-updates.component.html',
    styles: [`textarea { min-height: 100px;}`]
})

export class RostersChangesUpdatesComponent implements OnInit, OnDestroy {
    sStorage: any;
    instructions: string;
    constructor(public auth: AuthService, public router: Router, public titleService: Title, private common: CommonService, private rosterChangesModel: RosterChangesModel, private rosterChangesService: RosterChangesService) {
    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            this.rosterChangesModel = this.rosterChangesService.getRosterChangesModel();
            this.titleService.setTitle('Request Roster Changes – Kaplan Nursing');
        }
    }


    moveToCohort(student: ChangeUpdateRosterStudentsModal) {
        console.log('------------------------');
        console.log(student);
        if (!this.rosterChangesModel.students || this.rosterChangesModel.students.length === 0)
            this.rosterChangesModel.students = new Array<ChangeUpdateRosterStudentsModal>();
        this.rosterChangesModel.students.push(student);

        console.log(this.rosterChangesModel);

    }

    remove(studentToRemove: ChangeUpdateRosterStudentsModal): void {
        debugger;
        _.remove(this.rosterChangesModel.students, (student: ChangeUpdateRosterStudentsModal) => {
            return student.studentId === studentToRemove.studentId;
        })
    }

    updateUntimed(e: any): void {
        if (e) {
            let student: ChangeUpdateRosterStudentsModal = e.student;
            let studentToUpdate: ChangeUpdateRosterStudentsModal = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate)
                studentToUpdate.isGrantUntimedTest = e.checked;
        }
    }

    updateRepeater(e: any): void {
        if (e) {
            let student: ChangeUpdateRosterStudentsModal = e.student;
            let studentToUpdate: ChangeUpdateRosterStudentsModal = _.find(this.rosterChangesModel.students, { 'studentId': student.studentId });
            if (studentToUpdate)
                studentToUpdate.isRepeater = e.checked;
        }
    }


    redirectToReview(): void {
        // save instructions and student roster changes to sStorage and redirect
         this.rosterChangesModel.instructions = this.instructions;
         this.sStorage.setItem('rosterChanges', JSON.stringify(this.rosterChangesModel ));
         this.router.navigate(['rosters, roster-changes-summary']);
    }

}
