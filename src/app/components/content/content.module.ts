import { CardsModule } from "./../cards/cards.module";
import { PanelModule } from "./../panel/panel.module";
import { PipesModule } from "./../../pipes/pipes.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContentComponent } from "./content.component";

@NgModule({
  declarations: [ContentComponent],
  imports: [CommonModule, PipesModule, PanelModule, CardsModule],
  exports: [ContentComponent],
})
export class ContentModule {}
