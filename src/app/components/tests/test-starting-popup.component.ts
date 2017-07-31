import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {NgIf, NgFor} from '@angular/common';
// import {CommonService} from '../../services/common';
// import {TestService} from '../../services/test.service';
import { TestService } from './test.service';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'test-starting-popup',
    providers: [CommonService, TestService],
    templateUrl: './test-starting-popup.component.html',
    // directives: [, NgIf, NgFor],
    encapsulation: ViewEncapsulation.None,
    styles:[`@media (min-width: 48em){
            .modal-dialog {width: 635px;}}`]
})

export class TestingSessionStartingPopupComponent {
    @Input() popupId: string;
    @Input() cancelButtonText:string;
    @Input() okButtonText:string;
    @Input() heading: string;
    @Input() leadParagraph: string;
    @Input() paragraph: string;
    @Input() hideClose: boolean;
    @Output('onCancel') cancelEvent = new EventEmitter();
    @Output('onOK') okEvent = new EventEmitter();
    isStarted: boolean;
    constructor(public router: Router, public common: CommonService, public testService: TestService) {
    }


    onOK(e): void {
        this.okEvent.emit(this.popupId);
    }
    
    onCancel(e): void{
        this.cancelEvent.emit(this.popupId);
    }
}
	