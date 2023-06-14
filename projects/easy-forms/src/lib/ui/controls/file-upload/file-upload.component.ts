import {
  Component,
  ElementRef,
  Injector,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, UntypedFormControl } from "@angular/forms";
import { FilesUploadInterface } from "../../../interfaces/files-upload.interface";
import { ControlStatusEnum } from "../../../enums/control-status-enum";
import { FormHelper } from "../../../helpers/formHelper";
import { ControlStatusChanges } from "../../../interfaces/control-status-changes";
import { CommonModule } from "@angular/common";
import { AttributesDirective } from "../../../directives/attributes.directive";

@Component({
  selector: "easy-file-upload",
  templateUrl: "./file-upload.component.html",
  standalone: true,
  imports: [CommonModule, AttributesDirective],
})
export class FileUploadComponent
  implements ControlValueAccessor, OnInit, ControlStatusChanges
{
  @Input() config: any;
  @Input() control!: UntypedFormControl;
  @ViewChild("inputRef") inputRef!: ElementRef;

  selectedFiles: any[] = [];
  acceptableFileTypes: any;
  documentsService!: FilesUploadInterface;
  fieldTouched = false;
  fieldStatus: ControlStatusEnum | null = null;

  filesUploading = false;

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.acceptableFileTypes = this.config?.attributes?.accept
      ?.split(",")
      .map((value: any) => {
        return value.trim();
      });
    if (this.config?.metaData?.documentsService) {
      this.documentsService = this.injector.get<FilesUploadInterface>(
        this.config.metaData.documentsService
      );
    }
  }

  openFileUpload() {
    this.inputRef.nativeElement.click();
  }

  onInputChange(event: any) {
    if (!event.target?.files || event.target?.files?.length === 0) {
      this.control.markAsTouched();
      return;
    }
    this.selectedFiles = Object.entries(event.target.files).map(
      ([key, value]) => {
        return value;
      }
    );
    this.handleFiles(this.selectedFiles);
  }

  handleFiles(files: any) {
    if (this.filesInvalid(files)) {
      return;
    }
    if (!this.documentsService) {
      this.addFilesToForm(files);
      return;
    }
    this.uploadFileToRemoteService(files);
  }

  private filesInvalid(files: any): boolean {
    switch (true) {
      case this.sumOfFilesExceedSumMaxSize(files):
        this.control.setErrors({
          message: `Ukupna veličina datoteka premašuje dozvoljenu veličinu (${this.config.validators.sumMaxFileSize} MB)`,
          validationError: { sumOfFilesExceedSumMaxSize: true },
        });
        this.control.markAsTouched();
        return true;
      case this.singleFileExceedsMaxFileSize(files):
        this.control.setErrors({
          message: `Datoteke premašuju dozvoljenu veličinu po pojedinoj datoteci (${this.config.validators.maxFileSize} MB)`,
          validationError: { singleFileExceedsMaxFileSize: true },
        });
        this.control.markAsTouched();
        return true;
      case this.filesContainDisallowedType(files):
        this.control.setErrors({
          message: `Datoteke su nedozvoljenog tipa`,
          validationError: { filesContainDisallowedType: true },
        });
        this.control.markAsTouched();
        return true;
      case this.filesExceedMaxFileNumber(files):
        this.control.setErrors({
          message: `Količina datoteka premašuje dozvoljenu količinu (${this.config.validators.maxFileNumber})`,
          validationError: { filesExceedMaxFileNumber: true },
        });
        this.control.markAsTouched();
        return true;
      default:
        this.control.updateValueAndValidity({ emitEvent: false });
        return false;
    }
  }

  /**
   * Add files to File[] list and propagate to form
   * @param files added to input
   */
  addFilesToForm(files: any) {
    this.selectedFiles = files;
    this.propagateChange(this.selectedFiles);
  }

  /**
   * Upload files to Remote Service and propagate results to form
   * @param files added to input
   */
  uploadFileToRemoteService(files: any) {
    if (!files || files.length === 0 || !(files[0] instanceof File)) {
      this.propagateChange(files);
      return;
    }

    this.filesUploading = true;

    this.documentsService.uploadFiles(files).subscribe(
      (value) => {
        this.selectedFiles = value.map((fileInfo: any) => {
          const includeInValue = this.config?.metaData?.includeInValue;
          return { ...fileInfo, ...includeInValue };
        });
        this.propagateChange(this.selectedFiles);
        this.filesUploading = false;
      },
      (error) => {
        this.selectedFiles = [];
        this.filesUploading = false;
      }
    );
  }

  sumOfFilesExceedSumMaxSize(files: any[]): boolean {
    if (!this.config.validators?.sumMaxFileSize) {
      return false;
    }
    const filesSizeInMb = this.bytesToMb(
      files.map((file) => file.size).reduce((sum, current) => sum + current, 0)
    );
    return filesSizeInMb > this.config.validators.sumMaxFileSize;
  }

  singleFileExceedsMaxFileSize(files: any[]): boolean {
    if (!this.config.validators?.maxFileSize) {
      return false;
    }
    let singleFileExceedsMaxFileSize = false;
    files
      .filter((file) => file.size)
      .forEach((file) => {
        if (this.bytesToMb(file.size) > this.config.validators?.maxFileSize) {
          file.easyForms = {
            error: true,
            errorMessage: `datoteka je prevelika`,
          };
          singleFileExceedsMaxFileSize = true;
        }
      });
    return singleFileExceedsMaxFileSize;
  }

  filesContainDisallowedType(files: any[]): boolean {
    if (!this.acceptableFileTypes) {
      return false;
    }
    let filesContainDisallowedType = false;
    files
      .filter((file) => file.type)
      .forEach((file) => {
        if (!this.acceptableFileTypes.find((type: any) => type === file.type)) {
          file.easyForms = {
            error: true,
            errorMessage: `nedozvoljen tip datoteke`,
          };
          filesContainDisallowedType = true;
        }
      });
    return filesContainDisallowedType;
  }

  filesExceedMaxFileNumber(files: any[]): boolean {
    if (!this.config.validators?.maxFileNumber) {
      return false;
    }
    return files.length > this.config.validators.maxFileNumber;
  }

  writeValue(value: any) {
    if (value !== undefined && value !== null && value !== "") {
      this.selectedFiles = value;
      return;
    }
    this.selectedFiles = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  propagateChange = (parametar: any) => {};

  onBlur() {
    if (!this.fieldTouched) {
      this.fieldTouched = true;
    }

    this.onTouched();
  }

  onStatusChanges(status: ControlStatusEnum): void {
    if (status) {
      this.fieldStatus = status;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onTouched = () => {};

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  deleteFileFromUploadedFiles(position: number): void {
    if (this.selectedFiles[position]) {
      this.selectedFiles.splice(position, 1);
    }
    this.handleFiles(this.selectedFiles);
  }

  getAriaDescribedByIds(): string | null {
    return (
      [this.getAriaDescribedByErrorId(), this.getAriaDescribedByHelpId()]
        .filter((val) => val)
        .join(" ") || null
    );
  }

  getAriaDescribedByHelpId(): string | null {
    return this.config.help
      ? FormHelper.getFieldAriaDescribedByHelpId(this.config.id)
      : null;
  }

  getAriaDescribedByErrorId(): string | null {
    return this.isFieldInvalid()
      ? FormHelper.getFieldAriaDescribedByErrorId(this.config.id)
      : null;
  }

  isFieldInvalid(): boolean | null {
    return this.fieldTouched && this.fieldStatus === ControlStatusEnum.invalid
      ? true
      : null;
  }

  isFieldRequired(): boolean {
    return (
      this.config?.attributes?.required ||
      this.config?.validators?.required ||
      null
    );
  }

  bytesToMb(bytes: number): number {
    return bytes / (1024 * 1024);
  }
}
