import { DropdownOption } from "../models/dropdown-option.model";
import * as _ from "lodash";

export function getFormFieldOptions(conceptAnswers: any[]): DropdownOption[] {
  return (conceptAnswers || [])
    .map((answer: any) => {
      if (!answer) {
        return null;
      }

      const { uuid, display } = answer;
      return {
        key: uuid,
        value: uuid,
        label: display,
        name: display,
      };
    })
    .filter((option) => option);
}

export function createFormFieldsForOpenMRSForm(openMRSForm) {
  return _.map(openMRSForm?.formFields, (formField) => {
    return {
      id: formField?.uuid,
      name: formField?.display,
      label: formField?.display,
      key: formField?.uuid,
      dataType: null,
      formClass: null,
      options: [],
    };
  });
}
