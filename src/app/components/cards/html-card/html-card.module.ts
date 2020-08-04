import { PipesModule } from "./../../../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HtmlCardComponent } from "./html-card.component";

@NgModule({
  declarations: [HtmlCardComponent],
  imports: [CommonModule, PipesModule],
  exports: [HtmlCardComponent],
})
export class HtmlCardModule {}
