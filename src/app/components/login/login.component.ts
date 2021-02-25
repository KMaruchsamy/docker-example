import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { JWTTokenService } from './../../services/jwtTokenService';

@Component({
    selector: 'login',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
    sStorage: any = this.common.getStorage();
    constructor(public auth: AuthService, public router: Router, public titleService: Title, public common: CommonService, public jwtToken: JWTTokenService) {
        if (this.auth.isAuth()){
            if(!this.validateJwtToken())
                this.router.navigate(['/home']);
        }
          
        this.initialize();
    }
    
    ngOnInit(): void {
        this.titleService.setTitle('Faculty Sign In – Kaplan Nursing');
    }

    initialize(): void {
        //Appcues.anonymous();
        window.scroll(0,0);
    }

    validateJwtToken() {
        const jwtToken = this.sStorage.getItem('jwt');
        this.jwtToken.setToken(jwtToken);
        return this.jwtToken.isTokenExpired();
    } 
}