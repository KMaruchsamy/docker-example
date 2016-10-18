import { Component, Input } from '@angular/core';
@Component({
    selector: 'rosters-header',
    providers: [],
    templateUrl: 'components/rosters/rosters-header.component.html',
    directives: []
})
export class RostersHeaderComponent {
    @Input() institutionName: string;

    constructor() { }


}