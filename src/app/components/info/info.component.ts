import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-info",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.css"],
})
export class InfoComponent implements OnInit {
  data: any;
  constructor(
    private dialogRef: MatDialogRef<InfoComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: any
  ) {
    this.data = this.dialogData;
  }

  ngOnInit() {}
}
