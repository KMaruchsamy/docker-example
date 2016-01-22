import {Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, ElementRef} from 'angular2/core';
import {Router, RouteParams, OnDeactivate, ComponentInstruction} from 'angular2/router';
import {TestService} from '../../services/test.service';
import {Auth} from '../../services/auth';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestHeader} from './test-header';
import {TestScheduleModel} from '../../models/testSchedule.model';
import {RemoveWhitespacePipe} from '../../pipes/removewhitespace.pipe';
import * as _ from '../../lib/index';
import '../../plugins/dropdown.js';
// import '../../plugins/bootstrap-select.js';
import '../../plugins/bootstrap-select.min.js';
// import '../../plugins/tab.js';
// import '../../plugins/typeahead.bundle.js';
import '../../plugins/jquery.dataTables.min.js';
import '../../plugins/dataTables.responsive.js';


@Component({
    selector: 'add-students',
    templateUrl: '../../templates/tests/add-students.html',
    // styleUrls:['../../css/responsive.dataTablesCustom.css','../../css/jquery.dataTables.min.css'],
    providers: [TestService, Auth, TestScheduleModel],
    directives: [PageHeader, TestHeader, PageFooter],
    pipes: [RemoveWhitespacePipe]
})

export class AddStudents implements OnInit, OnDeactivate {
    institutionID: number;
    apiServer: string;
    subjectID: number;
    testTypeID: number;
    subjects: Object[] = [];
    tests: Object[] = [];
    testsTable: any;
    sStorage: any;
    constructor(public testService: TestService, public auth: Auth, public testScheduleModel: TestScheduleModel, public elementRef: ElementRef, public router: Router, public routeParams: RouteParams) {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.initialize();
    }
    routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        // this.logService.addLog(`Navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`);
        if (this.testsTable)
            this.testsTable.destroy();
      //  $('.selectpicker').val('').selectpicker('render');
    }

    ngOnInit() {
        
        // console.log('on init');
    }

    initialize(): void {
        this.testsTable = null;
        this.testScheduleModel.currentStep = 3;
        this.testTypeID = 1;
       // this.institutionID = parseInt(this.routeParams.get('institutionId'));
       // this.testScheduleModel.institutionId = this.institutionID;
        this.apiServer = this.auth.common.getApiServer();
        //this.loadSubjects();
    }
}