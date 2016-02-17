import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, CanDeactivate, ComponentInstruction} from 'angular2/router';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {ConfirmationPopup} from '../shared/confirmation.popup';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import {RoundPipe} from '../../pipes/round.pipe';
import {Utility} from '../../scripts/utility';
import * as _ from '../../lib/index';
import '../../plugins/dropdown.js';
import '../../plugins/bootstrap-select.min.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';
import '../../lib/modal.js';

@Component({
    selector: 'manage-tests',
    templateUrl: '../../templates/tests/manage-tests.html',
    providers: [TestService, Auth, TestScheduleModel, Utility, Common],
    directives: [PageHeader, TestHeader, PageFooter, ConfirmationPopup],
    pipes: [RemoveWhitespacePipe, RoundPipe]
})
export class ManageTests{
    
}
