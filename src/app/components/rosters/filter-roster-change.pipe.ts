import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';

@Pipe({
    name: 'filterrosterchange'
})

export class FilterRosterChange implements PipeTransform {
    transform(rosterChangesStudentModel: ChangeUpdateRosterStudentsModel[], updateType: number, addedFrom:number): ChangeUpdateRosterStudentsModel[] {
        return _.filter(rosterChangesStudentModel, { 'updateType': +updateType, 'addedFrom': +addedFrom });
    }
}
