import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";

@Component({
  selector: "app-functions",
  templateUrl: "./functions.component.html",
  styleUrls: ["./functions.component.scss"],
})
export class FunctionsComponent implements OnInit {
  formGroup: FormGroup;
  pageSizeOptions: any[] = [5, 10, 50, 100];
  totalRows: number;
  loading: boolean = false; // Flag variable
  file: File = null; //
  response: any = null;
  processes: any[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  displayedColumns: string[] = ["name", "description", "frequency", "actions"];

  constructor(
    private service: DatabaseService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.createForm();
    this.loadFunctions();
  }

  navigateToDashboard() {
    this.router.navigate(["./dashboard"]);
  }

  loadFunctions = () => {
    this.service
      .getProcesses({ page: this.currentPage, pageSize: this.pageSize })
      .then((res) => {
        this.processes = res.data;
        this.totalRows = res.count;
      });
  };

  createForm() {
    this.formGroup = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, [Validators.required]],
      frequency: [null, [Validators.required]],
      validate: "",
    });
  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  getValue(input: string) {
    return this.formGroup.get(input).value;
  }

  onUpload() {
    const data = {
      name: this.getValue("name"),
      description: this.getValue("description"),
      frequency: this.getValue("frequency"),
      file: this.file,
    };

    this.loading = !this.loading;
    this.service.saveFile(data).then((res) => {
      this.response = res;
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadFunctions();
  }
}
