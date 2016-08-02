import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {NgIf, NgFor} from '@angular/common';
import {Common} from '../../services/common';
import {TestService} from '../../services/test.service';

@Component({
    selector: 'test-starting-popup',
    providers: [Common, TestService],
    templateUrl: 'templates/tests/test-starting-popup.html',
    directives: [ROUTER_DIRECTIVES, NgIf, NgFor],
    encapsulation: ViewEncapsulation.None,
    styles:[`@media (min-width: 48em){
            .modal-dialog {width: 635px;}}`]
})

export class TestingSessionStartingPopup {
    @Input() popupId: string;
    @Input() cancelButtonText:string;
    @Input() okButtonText:string;
    @Input() heading: string;
    @Input() leadParagraph: string;
    @Input() paragraph: string;
    @Input() hideClose: boolean;
    @Output('onCancel') cancelEvent = new EventEmitter();
    @Output('onOK') okEvent = new EventEmitter();
    constructor(public router: Router, public common: Common, public testService: TestService) {
    }


    onOK(e): void {
        this.okEvent.emit(this.popupId);
    }
    
    onCancel(e): void{
        this.cancelEvent.emit(this.popupId);
    }
}
	