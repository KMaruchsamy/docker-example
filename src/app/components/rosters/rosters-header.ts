import { Component, Input } from '@angular/core';
@Component({
    selector: 'rosters-header',
    providers: [],
    templateUrl: 'templates/rosters/rosters-header.html',
    directives: []
})
export class RostersHeader {
    @Input() institutionName: string;

    constructor() { }


}