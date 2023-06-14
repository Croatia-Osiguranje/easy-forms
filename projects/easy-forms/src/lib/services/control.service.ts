import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Field } from '../models/field';
import { filter, map } from 'rxjs/operators';
import { FormHelper } from '../helpers/formHelper';
import { FormValue } from '../types/types';

@Injectable({
  providedIn: 'root',
})
export class ControlService {
  private fieldValueChangedSubject = new Subject<any>();
  private fieldValueChanged$ = this.fieldValueChangedSubject.asObservable();

  private fieldValidStatusChangedSubject = new Subject<any>();
  private fieldValidStatusChanged$ = this.fieldValidStatusChangedSubject.asObservable();

  setFieldValueChanged(field: Field, value: any) {
    this.fieldValueChangedSubject.next({ field, value });
  }

  setFieldValidStatusChanged(field: Field, value: any) {
    this.fieldValidStatusChangedSubject.next({ field, value });
  }

  /**
   * Listens to field changes and returns value of changed field only if valid
   */
  validStatusChanges(transformValues = true): Observable<any> {
    return this.fieldValidStatusChanged$.pipe(
      map(({ field, value }) => {
        return { [field.id]: transformValues ? FormHelper.applyFromFormTransformers(value, field) : value };
      })
    );
  }

  /**
   * Listens to specific field changes and returns value of changed field
   * @param fieldId id of the field that you want to listen to
   * @param transformValues should values be transformed before sending to subscriber
   */
  fieldValueChanges(fieldId: string, transformValues = true): Observable<any> {
    return this.fieldValueChanged$.pipe(
      filter(({ field }) => field.id === fieldId),
      map(({ field, value }) => {
        return transformValues ? FormHelper.applyFromFormTransformers(value, field) : value;
      })
    );
  }

  /**
   * Listens to all fields changes and returns { key: value } object of changed field
   * @param transformValues should values be transformed before sending to subscriber
   */
  fieldsValueChanges(transformValues = true): Observable<FormValue> {
    return this.fieldValueChanged$.pipe(
      map(({ field, value }) => {
        return { [field.id]: transformValues ? FormHelper.applyFromFormTransformers(value, field) : value };
      })
    );
  }

  /**
   * Listens to all fields changes with certain groupName and returns { key: value } object of changed field
   * @param transformValues should values be transformed before sending to subscriber
   * @param groupName groupName of the fields that you want to listen to
   */
  groupNameFieldsValueChanges(groupName: string, transformValues = true): Observable<FormValue> {
    return this.fieldValueChanged$.pipe(
      filter(({ field }) => field.groupName === groupName),
      map(({ field, value }) => {
        return { [field.id]: transformValues ? FormHelper.applyFromFormTransformers(value, field) : value };
      })
    );
  }

  fieldWithTriggersValueChanges(): Observable<Field> {
    return this.fieldValueChanged$.pipe(
      filter(({ field }) => {
        return !!field.triggers;
      }),
      map(({ field }) => field)
    );
  }
}
