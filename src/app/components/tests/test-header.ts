import {Component, Input, OnInit} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {RouterLink} from 'angular2/router';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';

@Component({
    selector: 'test-header',
    templateUrl: '../../templates/tests/test-header.html',
    inputs: ['testSchedule','scheduleStep'],
    directives: [RouterLink,NgIf],
    pipes: [ParseDatePipe]
})
    
export class TestHeader implements OnInit{
    nextDay: boolean = false;
    @Input() testSchedule;
    constructor(){}
    ngOnInit(): void{        
         if (this.testSchedule) {
            let startTime = this.testSchedule.scheduleStartTime;
            let endTime = this.testSchedule.scheduleEndTime;
            if (moment(endTime).isAfter(startTime, 'day'))
                this.nextDay = true;
        }
        
    }
}