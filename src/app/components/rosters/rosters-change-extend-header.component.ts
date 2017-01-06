import { Component, Input, OnInit, OnChanges } from '@angular/core';
import {Router} from '@angular/router';
import { RosterChangesModel } from '../../models/roster-changes.model';
import * as _ from 'lodash';
import { RosterUpdateTypes } from '../../constants/config';

@Component({
    selector: 'rosters-change-extend-header',
    templateUrl: './rosters-change-extend-header.component.html'
})
export class RostersChangeHeaderComponent implements OnInit{
    @Input() rosterChangesModel: RosterChangesModel;
    @Input() institutionName: string;
    @Input() pageType: string;

    sStorage: any;
    accountManagerId: number;
    institutionId: number;
    institutions: Array<any> = [];
    isExtendAccess: boolean = false;

    constructor( public router: Router) { }

    ngOnInit() {
        this.findAddedStudents();
    }

    findAddedStudents(): void {
        if (this.rosterChangesModel.students.length > 0) {
            this.isExtendAccess =  _.every(this.rosterChangesModel.students, ['updateType', RosterUpdateTypes.ExtendAccess]);
        }
    }
}
