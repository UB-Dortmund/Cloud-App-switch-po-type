import { catchError, finalize, map, tap } from "rxjs/operators";
import { MatSelect } from "@angular/material/select";
import { Component, ViewChild, OnInit, OnDestroy } from "@angular/core";
import {
  CloudAppRestService,
  CloudAppEventsService,
  PageInfo,
  HttpMethod,
  CloudAppStoreService,
} from "@exlibris/exl-cloudapp-angular-lib";
import { Request as ExRequest } from "@exlibris/exl-cloudapp-angular-lib";
import { EMPTY, forkJoin, Observable, Subscription } from "rxjs";
import { Constants } from "../constants";
import { ToastrService } from "ngx-toastr";
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
  @ViewChild(MatSelect, { static: false }) selectDrop: MatSelect;
  @ViewChild(NgForm, { static: false }) form: NgForm;
  storeSettings = new StoreSettings();
  pageLoad$: Subscription;
  loading: boolean = false;
  physicalPOLs: POL.Object[];
  cancelationQueue: { value: POL.Object; oldNum: string }[] = [];
  constructor(
    private eventService: CloudAppEventsService,
    private restService: CloudAppRestService,
    private toastr: ToastrService,
    private storeService: CloudAppStoreService
  ) {}
  ngOnInit() {
    this.pageLoad$ = this.eventService.onPageLoad(this.onPageLoad);
    this.loading = true;
    this.storeService.get("settings").subscribe({
      next: (res) => {
        if (res && Object.keys(res).length > 0) {
          this.storeSettings = res;
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
  ngOnDestroy() {
    if (this.pageLoad$) {
      this.pageLoad$.unsubscribe();
    }
  }

  get isPol() {
    return this.physicalPOLs && this.physicalPOLs.length !== 0;
  }

  onChangeSettings() {
    this.storeService
      .set("settings", this.storeSettings)
      .subscribe(() => console.log("Updated Settings"));
  }
  onPageLoad = (pageInfo: PageInfo) => {
    if (pageInfo && pageInfo.entities && pageInfo.entities.length > 0) {
      this.loading = true;
      this.physicalPOLs = [];
      this.cancelationQueue = [];
      for (let entity of pageInfo.entities) {
        this.restService.call(entity?.link).subscribe((res: POL.Object) => {
          if (Constants.physicalTypeSet.has(res.type.value)) {
            this.physicalPOLs.push(res);
          }
          this.loading = false;
        });
      }
    }
  };
  switchToElectronic() {
    this.loading = true;
    // let polToProcess: POL.Object[] = [];
    let observables: Observable<any>[] = [];
    // for (let option of this.selectDrop.selected as any[]) {
    //   polToProcess.push(option.value);
    // }
    let physicalPol = this.selectDrop.value;
    // for (let physicalPol of polToProcess) {
    if (physicalPol.status && physicalPol.status.value in Constants.allowedStatuses) {
      this.toastr.error(`Error : Could not transform ${physicalPol.number} with this status`);
    } else {
      physicalPol ? this.physicalToElectronic(physicalPol, observables) : null;
    }
    // }
    if (observables.length > 0) {
      forkJoin(observables).subscribe({
        next: (res) => {
          console.log("result from observ", res);
          res = res as { value: POL.Object; oldPol: POL.Object }[];
          for (let result of res) {
            if (result && result.value) {
              this.toastr.success(
                `Successfully created ${result.value.number} ,With type ${result.value.type.desc}`
              );
              this.cancelationQueue.push({ value: result.oldPol, oldNum: result.value.number });
            }
          }
          this.cancelAll();
        },
      });
    } else {
      this.loading = false;
    }
  }

  ifSelected = (): boolean =>
    !(this.selectDrop && this.selectDrop.selected && (this.selectDrop.selected as []).length !== 0);

  private physicalToElectronic(physicalPol: POL.Object, observables: Observable<any>[]) {
    let newPol: POL.Object = JSON.parse(JSON.stringify(physicalPol)); //Deep Copy
    console.log(newPol);
    newPol.type.value = Constants.typeMap.get(newPol.type.value);
    newPol.type.desc = null;
    newPol.number = null;
    //Creates observable
    let req: ExRequest = {
      url: "/almaws/v1/acq/po-lines",
      requestBody: newPol,
      method: HttpMethod.POST,
    };
    observables.push(
      this.restService.call(req).pipe(
        map((value) => {
          return { value, oldPol: physicalPol }; // Returns the oldPol to add cancelation
        }),
        catchError((err) => {
          this.toastr.error(`Failed to transform .${err.message},${physicalPol.number}`);
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
          this.toastr.error(`Failed to cancel. ${err.message},${poItem.value.number}`);

          return EMPTY;
        })
      );
      observables.push(observable);
    }
    forkJoin(observables).subscribe({
      next: (res) => {
        res.forEach((element: POL.Object) => {
          if (element && element.number) {
            this.toastr.success(`Successfully canceled ${element.number}`);
          }
        });
      },
      complete: () => {
        this.loading = false;
        this.eventService.refreshPage().subscribe(() => null);
      },
    });
  }
}
