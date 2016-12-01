import { Component, Input, OnInit, OnChanges } from '@angular/core';
import {Router} from '@angular/router';
import { RosterChangesModel } from '../../models/roster-changes.model';

@Component({
    selector: 'rosters-change-extend-header',
    templateUrl: './rosters-change-extend-header.component.html'
})
export class RostersChangeHeaderComponent {
    @Input() rosterChangesModel: RosterChangesModel;
    @Input() institutionName: string;
    @Input() cohortName: string;

    sStorage: any;
    accountManagerId: number;
    institutionId: number;
    institutions: Array<any> = [];
    constructor( public router: Router) { }
}
