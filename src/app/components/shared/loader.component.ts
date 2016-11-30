import {Component, OnInit, Input} from '@angular/core';
import {Router} from '@angular/router';
// import '../../lib/modal.js';

@Component({
    selector: 'loader',
    templateUrl: './loader.component.html'
})

export class LoaderComponent{
    @Input() loaderMessage;
    @Input() greetingMessage;   
}

	