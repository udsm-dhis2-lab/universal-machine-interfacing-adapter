import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Observable, of } from "rxjs";
import { Field } from "../../models/field.model";

@Component({
  selector: "app-field",
  templateUrl: "./field.component.html",
  styleUrls: ["./field.component.scss"],
})
export class FieldComponent {
  @Input() field: Field<string>;
  @Input() isReport: boolean;
  @Input() value: any;
  @Input() form: FormGroup;
  @Input() isCheckBoxButton: boolean;
  @Input() fieldClass: string;
  @Input() shouldDisable: boolean;
  members$: Observable<any[]> = of([]);

  constructor() {}

  @Output() fieldUpdate: EventEmitter<FormGroup> =
    new EventEmitter<FormGroup>();

  @Output() fileFieldUpdate: EventEmitter<any> = new EventEmitter<any>();

  ngAfterViewInit() {
    this.fieldUpdate.emit(this.form);
  }

  get isValid(): boolean {
    return this.form?.controls[this.field.id]?.valid;
  }

  get issueWithTheDataField(): string {
    const message = this.form?.controls[this.field.id]?.valid
      ? null
      : !this.form?.controls[this.field.id]?.valid &&
        this.form.controls[this.field.id]?.errors?.minlength
      ? `${this.field?.label} has not reached required number of characters`
      : !this.form?.controls[this.field.id]?.valid &&
        this.form.controls[this.field.id]?.errors?.maxlength
      ? `${this.field?.label} has exceeded required number of characters`
      : !this.form?.controls[this.field.id]?.valid
      ? `${this.field?.label} is required`
      : "";
    return message;
  }

  get hasMinimunLengthIssue(): boolean {
    return this.form.controls[this.field.id]?.errors?.minlength;
  }

  get hasMaximumLengthIssue(): boolean {
    return this.form.controls[this.field.id]?.errors?.maxlength;
  }

  get isDateTime(): boolean {
    return this.field.controlType === "date-time";
  }

  get isDate(): boolean {
    return this.field.controlType === "date";
  }

  get isBoolean(): boolean {
    return this.field.controlType === "boolean";
  }

  get isCommonField(): boolean {
    return (
      this.field?.controlType !== "checkbox" &&
      !this.isDate &&
      !this.isBoolean &&
      !this.isCheckBoxButton
    );
  }

  get fieldId(): string {
    return this.field?.id;
  }

  onFieldUpdate(): void {
    this.fieldUpdate.emit(this.form);
  }

  fileChangeEvent(event, field): void {
    let objectToUpdate = {};
    objectToUpdate[field?.key] = event.target.files[0];
    this.fileFieldUpdate.emit(objectToUpdate);
  }

  updateFieldOnDemand(objectToUpdate): void {
    this.form.patchValue(objectToUpdate);
    const theKey = Object.keys(objectToUpdate);
    this.form.setValue({ dob: new Date() });
    this.fieldUpdate.emit(this.form);
  }

  get getOptionValue(): any {
    const matchedOption = (this.field.options.filter(
      (option) => option?.key === this.value
    ) || [])[0];
    return matchedOption ? matchedOption?.value : "";
  }

  searchItem(event: any, field?: any): void {}

  searchItemFromOptions(event, field): void {
    const searchingText = event.target.value;
    this.members$ = of(
      field?.options?.filter(
        (option) =>
          option?.label?.toLowerCase()?.indexOf(searchingText?.toLowerCase()) >
          -1
      ) || []
    );
  }

  getSelectedItemFromOption(event: Event, item, field): void {
    event.stopPropagation();
    const value = item?.isDrug
      ? item?.formattedKey
      : item?.uuid
      ? item?.uuid
      : item?.id
      ? item?.id
      : item?.value;
    let objectToUpdate = {};
    objectToUpdate[field?.key] = item;
    this.form.patchValue(objectToUpdate);
    this.fieldUpdate.emit(this.form);
  }

  getStockStatus(option) {
    const optionName = option?.display ? option?.display : option?.name;
    return optionName.includes("Available, Location") ? true : false;
  }

  displayLabelFunc(value?: any): string {
    return value
      ? this.field?.options?.find(
          (option) => option?.value === (value?.value ? value?.value : value)
        )?.label
      : undefined;
  }
}
