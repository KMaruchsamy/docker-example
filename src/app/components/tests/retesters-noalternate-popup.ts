import {Component, Input, OnInit, Output, EventEmitter} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {Common} from '../../services/common';

@Component({
    selector: 'retesters-noalternate',
    templateUrl: '../../templates/tests/retesters-noalternate-popup.html',
    directives: [RouterLink],
    providers: [Common],
    inputs: ['studentRepeaters'],
    
})

export class RetesterNoAlternatePopup implements OnInit {
    @Input() studentRepeaters: any;
    @Output() retesterNoAlternatePopupOK = new EventEmitter();
    @Output() retesterNoAlternatePopupCancel = new EventEmitter();
    sStorage: any;
    constructor(public common: Common) {

    }

    ngOnInit(): void {
        // console.log(this.studentRepeaters);
    }

    removeStudents(e): void {
        e.preventDefault();
        let self = this;
        this.sStorage = this.common.getStorage();
        if (this.sStorage) {
            let savedSchedule = JSON.parse(this.sStorage.getItem('testschedule'));
            if (savedSchedule) {
                var removedStudents = _.remove(savedSchedule.selectedStudents, function(student) {
                    console.log(self.studentRepeaters);
                    return _.some(self.studentRepeaters, { 'StudentId':student.studentId })
                });
                this.retesterNoAlternatePopupOK.emit(savedSchedule);               
            }
        }       
    }
    
    
    cancel(e): void{
        e.preventDefault();
        this.retesterNoAlternatePopupCancel.emit(e);
    }

}
