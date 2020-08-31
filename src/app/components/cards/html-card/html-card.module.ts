import { PipesModule } from "./../../../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HtmlCardComponent } from "./html-card.component";
import { DirectivesModule } from './../../../directives/directives.module';

@NgModule({
  declarations: [HtmlCardComponent],
  imports: [CommonModule, PipesModule, DirectivesModule],
  exports: [HtmlCardComponent],
})
export class HtmlCardModule {}
