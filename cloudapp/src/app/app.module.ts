import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule, getTranslateModule } from "@exlibris/exl-cloudapp-angular-lib";
import { ToastrModule } from "ngx-toastr";
import { MatButtonModule } from "@angular/material/button";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { MainComponent } from "./main/main.component";
import { MatSelectModule } from "@angular/material/select";
import { CancelComponent } from './cancel/cancel.component';

export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: "toast-top-right",
    timeOut: 2000,
  });
}

@NgModule({
  declarations: [AppComponent, MainComponent, CancelComponent],
  imports: [
    MaterialModule,
    MatSelectModule,
    MatButtonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    getTranslateModule(),
    getToastrModule(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
