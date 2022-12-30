import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { materialModules } from "../material.modules";
import { fieldComponents } from "./components";
import { SearchFieldOptionPipe } from "./pipes/search-field-option.pipe";

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, ...materialModules],
  declarations: [...fieldComponents, SearchFieldOptionPipe],
  exports: [...fieldComponents],
})
export class CustomFormModule {}
