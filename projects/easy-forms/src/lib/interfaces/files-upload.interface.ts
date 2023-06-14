import { Observable } from 'rxjs';

export interface FilesUploadInterface {
  uploadFiles(request: Array<any>): Observable<any>;

  /**
   * @deprecated this method is deprecated, isn't called anywhere and will be removed in next releases
   */
  showErrorMessage?(options?: any): any;
}
