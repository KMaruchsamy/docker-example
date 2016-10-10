import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import { HelpHeaderComponent } from './help-header.component';
import { HelpContentComponent } from './help-content.component';

@Component({
    selector:'help',
    templateUrl:'components/help/help.component.html',
    directives:[HelpHeaderComponent, HelpContentComponent]
})
export class HelpComponent implements OnInit {
    constructor(public titleService: Title){
    }

    ngOnInit(): void {
        this.titleService.setTitle('Help – Kaplan Nursing');
    }    
}
