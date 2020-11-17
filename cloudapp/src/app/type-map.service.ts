import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CloudAppRestService } from "@exlibris/exl-cloudapp-angular-lib";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TypeMapService {
  constructor(private restService: CloudAppRestService) {}
  ngOnInit() {}
  get getAllTypes(): Observable<string[]> {
    return this.restService
      .call("/conf/code-tables/PurchaseType")
      .pipe(map((res) => res.row));
  }
  get getPhysicalTypes(): Observable<string[]> {
    return this.getAllTypes.pipe(
      map((res: any[]) => {
        return res.filter((element, index, array) => element.code.startsWith("P"));
      })
    );
  }
  get getElectronicTypes(): Observable<string[]> {
    return this.getAllTypes.pipe(
      map((res: any[]) => {
        return res.filter((element, index, array) => element.code.startsWith("E"));
      })
    );
  }
}
