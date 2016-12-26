import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { RosterUpdateTypes } from '../../constants/config';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';

@Pipe({
    name: 'filtermoveinto'
})

export class FilterMoveIntoPipe implements PipeTransform {
    transform(rosterChangesStudentModel: ChangeUpdateRosterStudentsModel[]): ChangeUpdateRosterStudentsModel[] {
        return _.filter(rosterChangesStudentModel, { 'updateType': +RosterUpdateTypes.MoveToThisCohort });
    }
}