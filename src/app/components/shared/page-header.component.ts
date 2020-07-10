import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./../../services/auth.service";
import { links } from "../../constants/config";
import { CommonService } from "./../../services/common.service";
import { Location } from "@angular/common";

@Component({
  selector: "page-header",
  templateUrl: "./page-header.component.html",
  styleUrls: ["./page-header.component.scss"]
})
export class PageHeaderComponent implements OnInit {
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

  constructor(
    public router: Router,
    public location: Location,
    public auth: AuthService,
    public common: CommonService
  ) {}
  ngOnInit(): void {
    this.apiServer = this.common.getApiServer();
    this.kaptestServer = this.common.getKaptestServer();
    this.updateHeaderBasedOnTemplate();
    this.getUserInfo();
    this.setAtomStudyPlanLink();
  }

  updateHeaderBasedOnTemplate() {
    this.username = this.auth.firstname + " " + this.auth.lastname;
    this.header = this.auth.dashboardTemplate
      ? JSON.parse(this.auth.dashboardTemplate).header
      : "";
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
    this.auth.logout();
    e.preventDefault();
    this.router.navigate(["/logout"]);
  }
}
