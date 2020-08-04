import { Component, OnInit, Input } from "@angular/core";
import { MatSelect } from "@angular/material/select";
import { Router } from "@angular/router";
import { links } from "../../../constants/config";

@Component({
  selector: "app-profile-card",
  templateUrl: "./profile-card.component.html",
  styleUrls: ["./profile-card.component.scss"]
})
export class ProfileCardComponent implements OnInit {
  @Input() card;
  flag: boolean;
  defaultProfileImage;
  constructor(public router: Router) {}
  ngOnInit() {
    this.defaultProfileImage = links.profile.nurseconsultant.defaultimage;
    this.flag = true;
  }
  routeTo(event) {
    this.flag = false;
    window.open(event, "_blank");
  }
}
