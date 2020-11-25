import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./../../services/auth.service";
import { links } from "../../constants/config";
import { CommonService } from "./../../services/common.service";
import { Location } from "@angular/common";
import betaTemplate from "../../../assets/json/template_beta.json";
import { Subscription } from 'rxjs';

@Component({
  selector: "page-header",
  templateUrl: "./page-header.component.html",
  styleUrls: ["./page-header.component.scss"]
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() showCover: boolean;
  @Input() ariaDisabled: boolean;
  @Input() hideDropdown: boolean;
  header: any;
  username: string;
  atomStudyPlanLink: string;
  apiServer: string;
  page: string;
  form: any;
  kaptestServer: string;
  userEmail: string;
  userId: number;
  firstName: string;
  lastName: string;
  templateJson: any;
  logoutSubscription: Subscription;

  constructor(
    public router: Router,
    public location: Location,
    public auth: AuthService,
    public common: CommonService
  ) {}
  ngOnInit(): void {
    this.apiServer = this.common.getApiServer();
    this.kaptestServer = this.common.getKaptestServer();
    this.auth.userName$.subscribe(user => (this.username = user));
    this.updateHeaderBasedOnTemplate();
    this.getUserInfo();
    this.setAtomStudyPlanLink();
  }

  updateHeaderBasedOnTemplate() {
    this.auth.userName$.subscribe(user => (this.username = user));
    this.header = this.auth.dashboardTemplate
      ? JSON.parse(this.auth.dashboardTemplate).header
      : this.getHeaderFromTemplate();

    if (this.username === "") {
      this.username = this.auth.firstname + " " + this.auth.lastname;
    }
  }
  getHeaderFromTemplate(): any {
    this.templateJson = betaTemplate;
    return this.templateJson.header;
  }

  setAtomStudyPlanLink() {
    this.atomStudyPlanLink =
      this.kaptestServer +
      links.atomStudyPlan.login.replace("§facultyEmail", this.userEmail);
  }
  getUserInfo(): void {
    this.userEmail = this.auth.useremail;
    this.userId = this.auth.userid;
    this.firstName = this.auth.firstname;
    this.lastName = this.auth.lastname;
  }
  redirectToKaptest() {
    var facultyAMLoginUrl =
      this.apiServer + links.api.baseurl + links.api.admin.facultyAMLoginUrl;
    this.auth
      .getKaptestRedirectURL(facultyAMLoginUrl, this.userId, this.userEmail)
      .subscribe(
        response => {
          if (response.ok) {
            const redirectUrl = response.body.toString();
            window.open(redirectUrl, "_blank");
          } else {
            try {
              window.open(this.atomStudyPlanLink, "_blank");
            } catch (error) {}
          }
        },
        error => {
          try {
            window.open(this.atomStudyPlanLink, "_blank");
          } catch (error) {}
        }
      );
  }
  logout(e) {
    
    this.clearNITServerCookies();
    this.auth.logout();
    e.preventDefault();
  }

  clearNITServerCookies() {
    let apiURL = this.apiServer + links.api.baseurl + links.api.admin.signOutApi + '?adminId=' + this.auth.userid;
    let logoutObservable  = this.auth.getAPIResponse(apiURL);
    this.logoutSubscription = logoutObservable.subscribe(
      response => {
        this.router.navigate(["/logout"]);
    });
  }

  ngOnDestroy() {
      if(this.logoutSubscription)
        this.logoutSubscription.unsubscribe();
  }
}
