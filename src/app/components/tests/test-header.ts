import {Component, Input} from 'angular2/core';
import {RouterLink} from 'angular2/router';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';

@Component({
    selector: 'test-header',
    templateUrl: '../../templates/tests/test-header.html',
    inputs: ['testSchedule','scheduleStep'],
    directives: [RouterLink],
    pipes: [ParseDatePipe]
})
    
export class TestHeader{
    
}