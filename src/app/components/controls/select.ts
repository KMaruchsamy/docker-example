import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {NgFor} from 'angular2/common';
@Component({
    selector: "ng2select",
    template: `
<label class="label-bold label-larger" for="{{selectId}}">{{selectText}}</label>
     <select #ng2select (change)="onChange(ng2select,$event);"
            class="selectpicker" [attr.data-width]="dataWidth" [attr.data-size]="dataSize" [attr.title]='title'>
      <option *ngFor="#option of options; #i = index" [selected]='option.value===selectedValue' [value]='option.value'>{{option.text}}</option>
     </select>
    `,
    inputs: [
        'options',
        'selectedValue',
        'selectId',
        'selectText',
        'dataWidth',
        'dataSize',
        'title'
    ]
})
export class Ng2Select {
    @Input() options: Object[];
    @Input() selectedValue: string;
    @Output('onSelectChange') onSelectChange = new EventEmitter();
    constructor() {

    }
    
    onChange(ng2select, $event) {

    }

}