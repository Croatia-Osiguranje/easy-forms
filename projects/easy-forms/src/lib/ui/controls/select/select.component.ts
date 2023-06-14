import { EasyFormsError } from "./../../../exceptions/forms.exception";
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { ControlValueAccessor, FormsModule } from "@angular/forms";
import { Observable, of, Subject, Subscription } from "rxjs";
import { SelectSearchTypeEnum } from "../../../enums/select-search-type-enum";
import { LookupInterface } from "../../../interfaces/lookup-interface";
import { FormHelper } from "../../../helpers/formHelper";
import { concatMap, debounceTime, switchMap } from "rxjs/operators";
import { CommonModule } from "@angular/common";
import { NgSelectModule } from "@ng-select/ng-select";

@Component({
  selector: "easy-select",
  templateUrl: "./select.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
})
export class SelectComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() config: any;

  selectSearchTypeEnum = SelectSearchTypeEnum;
  lookupService!: LookupInterface;
  value: string | null = null; // null is empty default state
  items: Array<any> = [];
  loading = false;
  searchable = false;
  disabled = false;
  searchType!: SelectSearchTypeEnum;

  // Defaults, can be overridden in step data under attributes
  // with same name
  notFoundText = "Nije pronađeno";
  loadingText = "Učitavamo podatke...";
  autocompleteText = "Počni tipkati...";
  idPropertyName = "id";
  labelPropertyName = "name";

  subscription: Subscription = new Subscription();
  subject: Subject<any> = new Subject();

  constructor(private injector: Injector, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setPropertyValues();
    this.setSelectAttributes(this.config);
    this.setSearchType(this.config);
    this.subscription.add(
      this.getSelectItems(this.config).subscribe((values) => {
        this.items = values.sort();
        this.loading = false;
        this.cdRef.detectChanges();
      })
    );

    if (this.isLookupLocationRemote() && this.config.lookupService) {
      this.subscription.add(this.subscribeOnRemoteLookupValues());
    }
  }

  subscribeOnRemoteLookupValues() {
    return this.subject
      .pipe(
        debounceTime(200),
        concatMap((event) => this.getRemoteLookupValues(event.term))
      )
      .subscribe((val: any) => {
        this.items = val;
        this.cdRef.detectChanges();
      });
  }

  getRemoteLookupValues(term: string) {
    if (term.length > 0) {
      return this.lookupService.getLookupValues(term);
    }

    if (term.length === 0) {
      return of([this.getEmptyConfigWithText(this.autocompleteText)]);
    }

    return of([]);
  }

  setPropertyValues() {
    const mapper = this.config?.metaData?.mapper;
    if (!mapper) {
      return;
    }
    if (mapper?.id) {
      this.idPropertyName = mapper.id;
    }
    if (mapper?.label) {
      this.labelPropertyName = mapper.label;
    }
  }

  setSelectAttributes(control: any) {
    const attributes = control?.attributes;
    if (attributes) {
      this.notFoundText = attributes.notFoundText;
      this.autocompleteText = attributes.autocompleteText;
      this.loadingText = attributes.autocompleteText;
      this.searchable = attributes.autocomplete;
      this.disabled = attributes.disabled;
    }
  }

  setSearchType(control: any) {
    if (control?.searchType) {
      this.searchType = control.searchType;
    }
  }

  getSelectItems(control: any): Observable<Array<any>> {
    if (control.options && control.options.length !== 0) {
      return of(control.options);
    }
    this.lookupService = this.injector.get<LookupInterface>(
      this.config.lookupService
    );

    if (this.isLookupLocationRemoteOnTrigger()) {
      this.lookupService = this.injector.get<LookupInterface>(
        this.config.lookupService
      );

      if (!this.lookupService.lookupStarted) {
        throw new EasyFormsError(
          `${this.config.lookupService} doesn't implement lookupStarted method!`
        );
      }
      this.loading = true;
      return this.lookupService.lookupStarted().pipe(
        switchMap(() => {
          return this.lookupService.getLookupValues();
        })
      );
    }

    if (this.isLookupLocationRemote()) {
      return of([this.getEmptyConfigWithText(this.autocompleteText)]);
    }
    if (control.lookupService) {
      this.loading = true;
      return this.lookupService.getLookupValues();
    }
    throw new EasyFormsError(`Select values configuration not supported`);
  }

  writeValue(value: any) {
    if (value !== undefined && value !== null && value !== "") {
      if (this.isLookupLocationRemote()) {
        this.items = [value];
      }
      this.value = value[this.getIdPropertyName()];
      return;
    }

    this.value = null;
    return;
  }

  propagateChange = (_: any) => {};

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onTouched = () => {};

  onBlur() {
    this.onTouched();
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  itemSelected(event: any = null) {
    let selectedValue = null;

    if (event && event[this.getIdPropertyName()]) {
      selectedValue = event;
    }
    this.propagateChange(selectedValue);

    this.value = selectedValue ? selectedValue[this.getIdPropertyName()] : null;

    return;
  }

  customSearchFn = (term: string, item: any) => {
    if (!term) {
      return false;
    }

    if (this.config.searchType === SelectSearchTypeEnum.startsWith) {
      return item[this.getLabelPropertyName()]
        .toLocaleLowerCase()
        .startsWith(term.toLocaleLowerCase());
    }

    return item[this.getLabelPropertyName()]
      .toLocaleLowerCase()
      .includes(term.toLocaleLowerCase());
  };

  getLabelPropertyName() {
    return this.labelPropertyName;
  }

  getIdPropertyName() {
    return this.idPropertyName;
  }

  onInputChange(event: any) {
    if (this.isLookupLocationRemote() && this.config.lookupService) {
      this.subject.next(event);
    }
  }

  getEmptyConfigWithText(text: string): any {
    const itemConfig: any = {};
    itemConfig[this.getIdPropertyName()] = null;
    itemConfig[this.getLabelPropertyName()] = text;
    itemConfig.disabled = true;
    return itemConfig;
  }

  /**
   * Get the loading text for dummy loader field.
   * Use field label or loading text or default.
   */
  getLoadingLabel(control: any): string {
    if (control?.attributes?.loadingText) {
      return control.attributes.loadingText;
    }
    if (control?.label) {
      return control.label;
    }
    return "Učitavamo podatke...";
  }

  isLookupLocationRemote() {
    return this.config?.lookupLocation === "remote";
  }

  isLookupLocationRemoteOnTrigger() {
    return this.config?.lookupLocation === "remoteOnTrigger";
  }

  getAriaDescribedBy(): string | null {
    return [
      this.getAriaDescribedByHelp(),
      FormHelper.getFieldAriaDescribedByErrorId(this.config.id),
    ]
      .filter((val) => val)
      .join(" ");
  }

  getAriaDescribedByHelp(): string | null {
    return this.config.help
      ? FormHelper.getFieldAriaDescribedByHelpId(this.config.id)
      : null;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
