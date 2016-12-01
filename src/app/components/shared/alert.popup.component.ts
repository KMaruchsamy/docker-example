import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'alert-popup',
    templateUrl: './alert.popup.component.html',
})

export class AlertPopupComponent implements OnInit {
    @Input() popupId: number;
    // @Input() cancelButtonText:string;
    @Input() okButtonText:string;
    @Input() message: string;
    @Input() hideClose: boolean;
    // @Output('onCancel') cancelEvent = new EventEmitter();
    @Output('onOK') okEvent = new EventEmitter();
    constructor() {

    }
    
    ngOnInit(): void{
    }

    onOK(e): void {
        this.okEvent.emit(this.popupId);
    }
    
    // onCancel(e): void{
    //     this.cancelEvent.emit(e);
    // }
    

}