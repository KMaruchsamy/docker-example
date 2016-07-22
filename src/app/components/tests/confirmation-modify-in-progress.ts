import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, OnDeactivate, ComponentInstruction} from '@angular/router-deprecated';
import {NgFor, NgIf} from '@angular/common';
import {Common} from '../../services/common';
import {Auth} from '../../services/auth';
import {PageHeader} from '../shared/page-header';
import {TestService} from '../../services/test.service';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {SelectedStudentModel} from '../../models/selectedStudent-model';
import * as _ from 'lodash';
import {SortPipe} from '../../pipes/sort.pipe';

@Component({
    selector: 'confirmation-modify-in-progress',
    templateUrl: 'templates/tests/confirmation-modify-in-progress.html',
    providers: [Auth, Common, TestService, TestScheduleModel, SelectedStudentModel],
    directives: [RouterLink, PageHeader, NgFor, NgIf],
    pipes: [SortPipe]
})
export class ConfirmationModifyInProgress implements OnInit, OnDeactivate {
    sStorage: any;
    removedStudents: SelectedStudentModel[]=[];
    studentsAdded: SelectedStudentModel[] = [];
    testName: string = "";
    constructor(public auth: Auth, public common: Common, public testService: TestService, public router: Router, public testScheduleModel: TestScheduleModel) {

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
        let _testScheduleModal = JSON.parse(this.sStorage.getItem('testschedule'));
        this.testName = _testScheduleModal.testName;
        let _prevStudentList: SelectedStudentModel[] = JSON.parse(this.sStorage.getItem('prevtestschedule')).selectedStudents;
        let _newStudentList: SelectedStudentModel[] = _testScheduleModal.selectedStudents;
        this.removedStudents = _.differenceWith(_prevStudentList, _newStudentList, _.isEqual);
        this.studentsAdded = _.differenceWith(_newStudentList, _prevStudentList, _.isEqual);
    }
   
}