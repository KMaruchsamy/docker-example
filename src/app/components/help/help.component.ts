import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import { HelpHeaderComponent } from './help-header.component';
import { HelpContentComponent } from './help-content.component';

@Component({
    selector:'help',
    templateUrl:'./help.component.html'
})
export class HelpComponent implements OnInit {
    constructor(public titleService: Title) {
    }

    ngOnInit(): void {
        this.titleService.setTitle('Help – Kaplan Nursing');
        window.scroll(0,0);
    }    
}
