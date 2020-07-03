import { PipesModule } from "./../../../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LinksCardComponent } from "./links-card.component";

@NgModule({
  declarations: [LinksCardComponent],
  imports: [CommonModule, PipesModule],
  exports: [LinksCardComponent],
})
export class LinksCardModule {}
