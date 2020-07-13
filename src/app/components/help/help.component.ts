import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import { AuthService } from './../../services/auth.service';

@Component({
    selector:'help',
    templateUrl:'./help.component.html'
})
export class HelpComponent implements OnInit {
    hideMenu: boolean = true;
    constructor(public titleService: Title, public auth:AuthService) {
    }

    ngOnInit(): void {
        this.titleService.setTitle('Help – Kaplan Nursing');
        if(this.auth.isAuth()) {
            this.hideMenu = false;
        }
        window.scroll(0,0);
    }
}
