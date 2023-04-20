import { Component, OnInit } from "@angular/core";
import { ElectronService } from "./core/services";
import { TranslateService } from "@ngx-translate/core";
import { DatabaseService } from "./services/database.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(
    private electronService: ElectronService,
    private databaseService: DatabaseService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang("en");
    if (this.electronService.isElectron) {
    } else {
      console.log("Running in Browser!!");
    }
  }

  ngOnInit(): void {
    if (this.electronService.isElectron) {
      this.databaseService.scheduleFunctions();
    }
  }
}
