import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JWTTokenService } from '../services/jwtTokenService';
import { AuthService } from '../services/auth.service';
 
@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {
  constructor(private jwtService: JWTTokenService,
    private router: Router,
    private auth: AuthService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      return this.ValidateRoute();
  }

  ValidateRoute(): boolean {
    if (this.auth.token) {
      this.jwtService.setToken(this.auth.token);  //  to override token,in case manually change jwt in browser localStorage.
      if (this.jwtService.isTokenExpired()) {
        this.auth.logout();
        this.router.navigate(['/'])
      } else {
        return true;
      }
  } else {
    this.auth.logout();
    this.router.navigate(['/'])
  }
  }
}