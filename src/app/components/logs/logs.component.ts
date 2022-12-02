import { Component, Input, NgZone, OnInit } from "@angular/core";
import { InterfaceService } from "../../services/interface.service";

@Component({
  selector: "app-logs",
  templateUrl: "./logs.component.html",
  styleUrls: ["./logs.component.css"],
})
export class LogsComponent implements OnInit {
  @Input() liveLogText: any[] = [];
  constructor(
    private interfaceService: InterfaceService,
    private _ngZone: NgZone
  ) {}

  ngOnInit() {
    this.interfaceService.liveLog.subscribe((mesg) => {
      this._ngZone.run(() => {
        this.liveLogText = mesg;
      });
    });
  }
}
