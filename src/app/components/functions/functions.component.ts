import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-functions",
  templateUrl: "./functions.component.html",
  styleUrls: ["./functions.component.scss"],
})
export class FunctionsComponent implements OnInit {
  loading: boolean = false; // Flag variable
  file: File = null; //
  response: any = null;
  name: string = null;
  description: string = null;
  frequency: string = null;
  processes: any[] = [];
  displayedColumns: string[] = ["position", "name", "weight", "symbol"];

  constructor(private service: DatabaseService, private router: Router) {}

  ngOnInit() {
    this.service.getProcesses().then((res) => {
      this.processes = res;
      console.log(JSON.stringify(this.processes));
    });
  }

  navigateToDashboard() {
    this.router.navigate(["./dashboard"]);
  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }
  onInputChange(event: any, input: string | number) {
    event.stopPropagation();
    this[input] = event.target.value;
  }

  onUpload() {
    const data = {
      name: this.name,
      description: this.description,
      frequency: this.frequency,
      file: this.file,
    };
    this.loading = !this.loading;
    this.service.saveFile(data).then((res) => {
      this.response = res;
    });
  }
}
