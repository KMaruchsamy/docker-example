import { Component, Input } from '@angular/core';
@Component({
    selector: 'rosters-header',
    templateUrl: './rosters-header.component.html'
})
export class RostersHeaderComponent {
    @Input() institutionName: string;

    constructor() { }


}