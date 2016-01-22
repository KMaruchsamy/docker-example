import {Component,Input} from 'angular2/core';
import {NgFor} from 'angular2/common';
@Component({
    selector: "ng2select",
    template: `
     <select #ng2select (change)="loadTests(subjectDropDown.value)"
            class="selectpicker" data-width="400" data-size="6" title='Choose a test by subject'>
      <option *ngFor="#option of options; #i = index" [selected]='option.value===selectedValue' [value]='option.value'>{{option.text}}</option>
     </select>
    `,
    inputs:['options','selectedValue']
})
export class Ng2Select{
    @Input() options: Object[];
    @Input() selectedValue: string;
    
    constructor() {
        
    }
}