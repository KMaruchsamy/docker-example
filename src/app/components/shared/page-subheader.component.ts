import { Component } from '@angular/core';

@Component({
    selector:'page-subheader',
    templateUrl:'./page-subheader.component.html',
    styles:[`
    .ad{
        padding:2px 10px;
        font-size:8pt;
        border-radius:2px;
    }

    .red{
        background-color:#BD2828;
        color:#FFF;
    }

    .covid-yellow {
        background-color: #feee67;
      }

      .covid-font {
        font-size: 22px;
      }
    `]
})
export class PageSubheaderComponent {
}
