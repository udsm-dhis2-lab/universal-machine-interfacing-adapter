import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";

import { AppRoutingModule } from "./app-routing.module";

// NG Translate
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { HomeModule } from "./home/home.module";

import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { FunctionsComponent } from "./components/functions/functions.component";
import { InfoComponent } from "./components/info/info.component";
import { LogsComponent } from "./components/logs/logs.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { ElectronService } from "./core/services";
import { materialModules } from "./material.modules";
import { DatabaseService } from "./services/database.service";
import { ElectronStoreService } from "./services/electron-store.service";
import { InterfaceService } from "./services/interface.service";

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, "./assets/i18n/", ".json");

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    DashboardComponent,
    FunctionsComponent,
    LogsComponent,
    InfoComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
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
