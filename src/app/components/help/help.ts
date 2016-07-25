import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {HelpHeader} from './help-header';
import {HelpContent} from './help-content';

@Component({
    selector:'help',
    templateUrl:'templates/help/help.html',
    directives:[HelpHeader, HelpContent]
})
export class Help implements OnInit {
    constructor(public titleService: Title){
    }

    ngOnInit(): void {
        this.titleService.setTitle('Help – Kaplan Nursing');
    }    
}
