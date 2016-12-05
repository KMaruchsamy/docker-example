import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { telNumbers } from '../../constants/config';

@Component({
    selector: 'rosters-no-AM',
    templateUrl: './rosters-no-AM.component.html'
})

export class RostersNoAMComponent implements OnInit {
    supportHotline: string;
    outsideUSHotline: string;
    constructor(public titleService: Title, private auth: AuthService, public router: Router) {}

    ngOnInit(): void {
        if (this.auth.isAuth()) {
            this.titleService.setTitle('No Account Manager – Kaplan Nursing');
            this.supportHotline = telNumbers.supportHotline;
            this.outsideUSHotline = telNumbers.outsideUSCanadaSupportHotline;
        }
        else
            this.router.navigate(['/']);
    }
}
