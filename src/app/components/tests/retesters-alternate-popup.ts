import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {NgIf, NgFor} from 'angular2/common';
import {RouterLink} from 'angular2/router';
import {Common} from '../../services/common';

@Component({
    selector: 'retesters-alternate',
    templateUrl: '../../templates/tests/retesters-alternate-popup.html',
    providers: [Common],
    directives: [RouterLink, NgIf, NgFor]
})

export class RetesterAlternatePopup {
    @Input() testScheduledSudents: Object[];
    @Input() testTakenStudents: Object[];
    @Input() testSchedule: any;
    @Output() retesterAlternatePopupOK = new EventEmitter();
    @Output() retesterAlternatePopupCancel = new EventEmitter();
    valid: boolean = false;
    sStorage: any;
    constructor(public common: Common) {
        console.log(moment().format('h:mm:ss:sss'));
    }

    ngOnInit(): void {
        console.log('<<>>');
        console.log(JSON.stringify(this.testScheduledSudents));
        console.log('<<>>');
        console.log(JSON.stringify(this.testTakenStudents));
        console.log('<<>>');
        console.log(JSON.stringify(this.testSchedule));
    }

    resolve(e): void {
        e.preventDefault();
        let self = this;
        this.sStorage = this.common.getStorage();
        if (this.sStorage) {
            let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
            if (savedSchedule) {
                // var removedStudents = _.remove(savedSchedule.selectedStudents, function(student) {
                //     console.log(self.studentRepeaters);
                //     return _.some(self.studentRepeaters, { 'StudentId': student.studentId })
                // });
                this.retesterAlternatePopupOK.emit(savedSchedule);
            }
        }
    }


    cancel(e): void {
        e.preventDefault();
        this.retesterAlternatePopupCancel.emit(e);
    }

    onChangeTestTaken(studentId: number, e): void {
        let student: any = _.find(this.testTakenStudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;

        console.log(this.testTakenStudents);
        this.validate();
    }

    onChangeTestScheduled(studentId: number, e): void {
        let student: any = _.find(this.testScheduledSudents, { 'StudentId': studentId });
        if (student)
            student.Checked = true;

        console.log(this.testScheduledSudents);
        this.validate();
    }
    
    validate(): boolean{
        let unselectedTestsTaken = _.some(this.testTakenStudents, { 'Checked': false });
        let unselectedTestsScheduled = _.some(this.testScheduledSudents, { 'Checked': false });
        console.log(unselectedTestsTaken, unselectedTestsScheduled);
        if (unselectedTestsTaken || unselectedTestsScheduled)
        {
            this.valid = false;
            return false;
        }    
        
        this.valid = true;
        return true;
    }
}