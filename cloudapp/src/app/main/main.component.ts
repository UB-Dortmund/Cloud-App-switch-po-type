import { catchError, finalize, map, tap } from "rxjs/operators";
import { MatSelect } from "@angular/material/select";
import { Component, ViewChild, OnInit, OnDestroy } from "@angular/core";
import {
  CloudAppRestService,
  CloudAppEventsService,
  PageInfo,
  HttpMethod,
  CloudAppStoreService,
  AlertService,
} from "@exlibris/exl-cloudapp-angular-lib";
import { Request as ExRequest } from "@exlibris/exl-cloudapp-angular-lib";
import { EMPTY, forkJoin, Observable, Subscription } from "rxjs";
import { Constants } from "../constants";
import { NgForm } from "@angular/forms";
const CANCEL_REASON = "LIBRARY_CANCELLED";
class StoreSettings {
  override: boolean = true;
  inform_vendor: boolean = false;
}
@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild('physicalSelect', { static: false }) physicalSelectDrop: MatSelect;
  @ViewChild('electronicSelect', { static: false }) electronicSelectDrop: MatSelect;
  @ViewChild('ownerSelect', { static: false }) ownerSelectDrop: MatSelect;
  @ViewChild(NgForm, { static: false }) form: NgForm;
  storeSettings = new StoreSettings();
  pageLoad$: Subscription;
  isLoading: boolean = false;
  physicalPOLs: POL.Object[];
  electronicPOLs: POL.Object[];
  cancelationQueue: { value: POL.Object; oldNum: string }[] = [];
  toEelectronicbuttonType = true;

  POLowners: [];
  
  constructor(
    private eventService: CloudAppEventsService,
    private restService: CloudAppRestService,
    private alert: AlertService,
    private storeService: CloudAppStoreService
  ) {}

  get isOnlyOneEntity():boolean {
    return this.physicalPOLs.length===1||true;
  }
  ngOnInit() {
    this.pageLoad$ = this.eventService.onPageLoad(this.onPageLoad);
    this.isLoading = true;
    this.storeService.get("settings").subscribe({
      next: (res) => {
        if (res && Object.keys(res).length > 0) {
          this.storeSettings = res;
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }
  ngOnDestroy() {
    if (this.pageLoad$) {
      this.pageLoad$.unsubscribe();
    }
  }

  get isPol() {
    return (this.physicalPOLs && this.physicalPOLs.length !== 0)
    || (this.electronicPOLs && this.electronicPOLs.length !== 0);
  }

  onChangeSettings() {
    this.storeService
      .set("settings", this.storeSettings)
      .subscribe(() => console.log("Updated Settings"));
  }
  onPageLoad = (pageInfo: PageInfo) => {
    console.log("PageLoad",pageInfo);
    if (pageInfo && pageInfo.entities && pageInfo.entities.length > 0) {
      this.isLoading = true;


      this.POLowners = [];
      this.restService.call("/almaws/v1/conf/libraries").subscribe(res => {
        console.log(res.library);
        /*for (let lib of res.library) {
          console.log(lib);
        }*/
        this.POLowners = res.library;
      });

      //console.log("val:" +this.ownerSelectDrop.value);
      //console.log("sel:" +this.ownerSelectDrop.selected);


      this.physicalPOLs = [];
      this.electronicPOLs = [];
      this.cancelationQueue = [];
      for (let entity of pageInfo.entities) {
        this.restService.call(entity?.link).subscribe((res: POL.Object) => {
          if (Constants.physicalTypeSet.has(res.type.value)) {
            this.physicalPOLs.push(res);
          }
          else if (Constants.electronicTypeSet.has(res.type.value)) {
            this.electronicPOLs.push(res);
          }
          this.isLoading = false;
        });
      }
    }
  };
  switchToElectronic() {
    this.isLoading = true;
    let observables: Observable<any>[] = [];
    let physicalPol = this.physicalSelectDrop.value;
    
    if (physicalPol.status && physicalPol.status.value in Constants.allowedStatuses) {
      this.alert.error(`Error : Could not transform ${physicalPol.number} with this status`);
    } else {
      physicalPol ? this.transformPOL(physicalPol, observables) : null;
    }
    if (observables.length > 0) {
      forkJoin(observables).subscribe({
        next: (res) => {
          console.log("result from observ", res);
          res = res as { value: POL.Object; oldPol: POL.Object }[];
          for (let result of res) {
            if (result && result.value) {
              this.alert.success(
                `Successfully created POL : ${result.value.number} ,With type ${result.value.type.desc}`
              ,{autoClose:false});
              this.cancelationQueue.push({ value: result.oldPol, oldNum: result.value.number });
            }
          }
          this.cancelAll();
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  switchToPhysical() {
    this.isLoading = true;
    let observables: Observable<any>[] = [];
    let electronicPol = this.electronicSelectDrop.value;

    if (electronicPol.status && electronicPol.status.value in Constants.allowedStatuses) {
      this.alert.error(`Error : Could not transform ${electronicPol.number} with this status`);
    } else {
      electronicPol ? this.transformPOL(electronicPol, observables) : null;
    }
    if (observables.length > 0) {
      forkJoin(observables).subscribe({
        next: (res) => {
          console.log("result from observ", res);
          res = res as { value: POL.Object; oldPol: POL.Object }[];
          for (let result of res) {
            if (result && result.value) {
              this.alert.success(
                `Successfully created POL : ${result.value.number} ,With type ${result.value.type.desc}`
              ,{autoClose:false});
              this.cancelationQueue.push({ value: result.oldPol, oldNum: result.value.number });
            }
          }
          this.cancelAll();
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  ifPhysicalSelected = (): boolean =>
    !(this.physicalSelectDrop && this.physicalSelectDrop.selected && (this.physicalSelectDrop.selected as []).length !== 0)

  ifElectronicSelected = (): boolean => 
    !(this.electronicSelectDrop && this.electronicSelectDrop.selected && (this.electronicSelectDrop.selected as []).length !== 0);

  ifOwnerSelected = (): boolean =>
    !(this.ownerSelectDrop && this.ownerSelectDrop.selected && (this.ownerSelectDrop.selected as []).length !== 0);

  clearOwner() {
    this.ownerSelectDrop.value = null;
  }
    
  private transformPOL(currentPol: POL.Object, observables: Observable<any>[]) {
    let newPol: POL.Object = JSON.parse(JSON.stringify(currentPol)); //Deep Copy
    console.log(newPol);
    newPol.type.value = Constants.typeMap.get(newPol.type.value);
    newPol.type.desc = null;
    newPol.number = null;

    if (this.ownerSelectDrop.value) {
      const newOwner = this.ownerSelectDrop.value;
      console.log("Setting new Owner:");
      console.log(newOwner);
      newPol.owner.value = newOwner.code;
      newPol.owner.desc = null;
    }

    //Creates observable
    let req: ExRequest = {
      url: "/almaws/v1/acq/po-lines",
      requestBody: newPol,
      method: HttpMethod.POST,
    };
    observables.push(
      this.restService.call(req).pipe(
        map((value) => {
          return { value, oldPol: currentPol }; // Returns the oldPol to add cancelation
        }),
        catchError((err) => {
          this.alert.error(`Failed to transform .${err.message},${currentPol.number}`);
          this.isLoading = false;
          return EMPTY;
        })
      )
    );
  }

  private cancelAll() {
    let observables = [];

    console.log("In cancel", this.cancelationQueue, this.form.value);

    for (let poItem of this.cancelationQueue) {
      let req: ExRequest = {
        url: `/almaws/v1/acq/po-lines/${poItem.value.number}`,
        method: HttpMethod.DELETE,
        queryParams: {
          reason: CANCEL_REASON,
          comment: `Replaced by ${poItem.oldNum} by Cloud App. ${this.form.value.comment}`,
          override: this.storeSettings.override,
          inform_vendor: this.storeSettings.inform_vendor,
        },
      };
      let observable = this.restService.call(req).pipe(
        map(() => poItem.value),
        catchError((err) => {
          console.error(err);
          this.alert.warn(`Failed to cancel. ${err.message},${poItem.value.number}`);

          return EMPTY;
        })
      );
      observables.push(observable);
    }
    forkJoin(observables).subscribe({
      next: (res) => {
        res.forEach((element: POL.Object) => {
          if (element && element.number) {
            this.alert.success(`Successfully canceled POL :${element.number}`,{autoClose:false});
          }
        });
      },
      complete: () => {
        this.isLoading = false;
        this.isOnlyOneEntity?this.eventService.back().subscribe(()=>null):this.eventService.refreshPage().subscribe(() => null);
      },
    });
  }
  onPhysicalChange(){
    this.toEelectronicbuttonType = true;
    this.electronicSelectDrop.value = null;
  }
  onElectronicChange(){
    this.toEelectronicbuttonType = false;
    this.physicalSelectDrop.value = null;
  }
  onOwnerChange(){
    console.log("Selected new Owner:");
    console.log(this.ownerSelectDrop.value);
  }
}
