import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';

@Pipe({
    name: 'filterrosterchange'
})

export class FilterRosterChange implements PipeTransform {
    transform(rosterChangesStudentModel: ChangeUpdateRosterStudentsModel[], updateType: number, addedFrom: number): ChangeUpdateRosterStudentsModel[] {
        return _.sortBy(_.filter(rosterChangesStudentModel, { 'updateType': +updateType, 'addedFrom': +addedFrom }),
            [(student) => {
                return student.lastName.toLowerCase();
            }, (student) => {
                return student.firstName.toLowerCase();
            }]);
    }
}
