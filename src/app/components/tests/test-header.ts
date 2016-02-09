import {Component, Input} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {TestService} from '../../services/test.service';
import {TestScheduleModel} from '../../models/testSchedule.model';

@Component({
    selector: 'test-header',
    templateUrl: '../../templates/tests/test-header.html',
    inputs: ['testSchedule', 'scheduleStep'],
    directives: [RouterLink],
    providers: [TestService, TestScheduleModel],
    pipes: [ParseDatePipe]
})

export class TestHeader {

    constructor(public testService: TestService, public testScheduleModel: TestScheduleModel) {
        this.testScheduleModel = this.testService.getTestSchedule();
        if (!(typeof (this.testScheduleModel) == 'undefined')) {
            if (this.testScheduleModel.currentStep == 2) {
                $('#managetestHeader').removeClass('container-medium-width');
                $('#managetestHeader').addClass('container');
                $('#managetestbreadcrum').removeClass('container-medium-width manage-test-breadcrumb');
                $('#managetestbreadcrum').addClass('container manage-test-breadcrumb');
            }
        }
    }
}