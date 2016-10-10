import {Component, OnInit, Input} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
// import '../../lib/modal.js';

@Component({
    selector: 'loader',
    templateUrl: 'components/shared/loader.component.html',
    directives: [ROUTER_DIRECTIVES]
})

export class LoaderComponent{
    @Input() loaderMessage;
    @Input() greetingMessage;   
}

	