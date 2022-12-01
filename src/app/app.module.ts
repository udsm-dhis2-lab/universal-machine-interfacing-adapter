import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";

import { AppRoutingModule } from "./app-routing.module";

// NG Translate
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { HomeModule } from "./home/home.module";

import { CommonModule } from "@angular/common";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { FunctionsComponent } from "./components/functions/functions.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { ElectronService } from "./core/services";
import { DatabaseService } from "./services/database.service";
import { ElectronStoreService } from "./services/electron-store.service";
import { InterfaceService } from "./services/interface.service";
import { materialModules } from "./material.modules";

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, "./assets/i18n/", ".json");

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    DashboardComponent,
    FunctionsComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    AppRoutingModule,
    ...materialModules,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    ElectronService,
    DatabaseService,
    InterfaceService,
    ElectronStoreService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
