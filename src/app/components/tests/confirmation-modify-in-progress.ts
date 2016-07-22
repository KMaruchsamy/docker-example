import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, OnDeactivate, ComponentInstruction} from '@angular/router-deprecated';
import {NgFor, NgIf} from '@angular/common';
import {Common} from '../../services/common';
import {Auth} from '../../services/auth';
import {PageHeader} from '../shared/page-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {TestService} from '../../services/test.service';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import * as _ from 'lodash';
import {SortPipe} from '../../pipes/sort.pipe';

@Component({
    selector: 'confirmation-modify-in-progress',
    templateUrl: 'templates/tests/confirmation-modify-in-progress.html',
    directives: [RouterLink, PageHeader, NgFor],
    providers: [Auth, Common, TestService, Router,TestScheduleModel,SelectedStudentModel],
    pipes: [SortPipe]
})
export class ConfirmationModifyInProgress implements OnInit, OnDeactivate {
    sStorage: any;
    removedStudents: SelectedStudentModel[]=[];
    studentsAdded: SelectedStudentModel[]=[];

    constructor(public auth: Auth, public common: Common, public testService: TestService, public schedule: TestScheduleModel, public router: Router) {

    }

    ngOnInit(): void {
        this.sStorage = this.common.getStorage();
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else {
            this.initialization();
        }
    }
    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction): void {
        let outOfTestScheduling: boolean = this.testService.outOfTestScheduling((this.common.removeWhitespace(next.urlPath)));
        if (outOfTestScheduling)
            this.testService.clearTestScheduleObjects();      
    }
    initialization(): void {
        let _prevStudentList: SelectedStudentModel[] = this.sStorage.getItem('prevtestschedule').selectedStudents;
        let _newStudentList: SelectedStudentModel[] = this.sStorage.getItem('testschedule').selectedStudents;
        this.removedStudents = _.difference(_prevStudentList, _newStudentList);
        this.studentsAdded = _.difference(_newStudentList, _prevStudentList);
    }
}