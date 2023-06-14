import { Observable } from 'rxjs';
import { LookupResult } from './lookup-result';

export interface LookupInterface {
  getLookupValues(value?: any): Observable<Array<LookupResult>>;
  startLookup?(): void;
  lookupStarted?(): Observable<any>;
}
