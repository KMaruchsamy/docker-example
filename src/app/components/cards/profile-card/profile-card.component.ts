import { Component, OnInit, Input } from "@angular/core";
import { MatSelect } from "@angular/material/select";
import { Router } from "@angular/router";

@Component({
  selector: "app-profile-card",
  templateUrl: "./profile-card.component.html",
  styleUrls: ["./profile-card.component.scss"]
})
export class ProfileCardComponent implements OnInit {
  @Input() card;
  flag: boolean;
  constructor(public router: Router) {}
  ngOnInit() {
    this.flag = true;
  }
  routeTo(event){
    this.flag = false;
    window.open(event,'_blank');
  }
}
