import {Component, Input} from 'angular2/core';
import {RouterLink} from 'angular2/router';


@Component({
    selector: 'test-header',
    templateUrl: '../../templates/tests/test-header.html',
    inputs: ['testSchedule','scheduleStep'],
    directives:[RouterLink]
})
    
export class TestHeader{
    
}