import { catchError, finalize, map } from "rxjs/operators";
import { MatSelect } from "@angular/material/select";
import { Component, ViewChild, OnInit, OnDestroy } from "@angular/core";
import {
  CloudAppRestService,
  CloudAppEventsService,
  PageInfo,
  Entity,
  HttpMethod,
} from "@exlibris/exl-cloudapp-angular-lib";
import { Request as ExRequest } from "@exlibris/exl-cloudapp-angular-lib";
import { EMPTY, forkJoin, Observable, Subscription } from "rxjs";
import { Constants } from "../constants";
import { ToastrService } from "ngx-toastr";

export interface CancelReason {
  code: string;
  description: string;
}
@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild(MatSelect, { static: false }) selectDrop: MatSelect;
  pageLoad$: Subscription;
  loading: boolean = false;
  physicalPOLs: POL.Object[];
  cancelationQueue: POL.Object[];
  cancelReasons: CancelReason[] = [];
  constructor(
    private eventService: CloudAppEventsService,
    private restService: CloudAppRestService,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.pageLoad$ = this.eventService.onPageLoad(this.onPageLoad);
    this.loading = true;
    this.restService.call("/conf/code-tables/POLineCancellationReasons").subscribe({
      next: (res) => {
        if (res && res.row) {
          res.row.forEach((row) => {
            this.cancelReasons.push({
              code: row.code,
              description: row.description,
            } as CancelReason);
          });
        }
      },
      error: (err) => {
        this.toastr.error(err);
      },
      complete: () => (this.loading = false),
    });
  }
  ngOnDestroy() {
    if (this.pageLoad$) {
      this.pageLoad$.unsubscribe();
    }
  }

  onPageLoad = (pageInfo: PageInfo) => {
    if (pageInfo.entities && pageInfo.entities.length > 0) {
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
    let polToProcess: POL.Object[] = [];
    let observables: Observable<any>[] = [];
    for (let option of this.selectDrop.selected as any[]) {
      polToProcess.push(option.value);
    }
    for (let physicalPol of polToProcess) {
      if (physicalPol.status && physicalPol.status.value in Constants.forbiddenStatuses) {
        //TODO Add nice error message
        this.toastr.error("Error");
      } else {
        //TODO Manipulate object
        this.physicalToElectronic(physicalPol, observables);
      }
    }
    if (observables.length > 0) {
      forkJoin(observables).subscribe({
        next: (res) => {
          res = res as { value: POL.Object; oldPol: POL.Object }[];
          for (let result of res) {
            if (result && result.value) {
              this.toastr.success(
                `Successfully created ${result.value.number} ,With type ${result.value.type.desc}`
              );
              this.cancelationQueue.push(result.oldPol);
            }
          }
          this.eventService.refreshPage().subscribe(() => null);
        },
      });
    }
  }

  onCancel(
    cancelIdx: number,
    reason: string,
    comment: string,
    override: boolean,
    informVendor: boolean
  ) {
    let poItem = this.cancelationQueue[cancelIdx];
    let req: ExRequest = {
      url: `/almaws/v1/acq/po-lines/${poItem.number}`,
      method: HttpMethod.DELETE,
      queryParams: {
        reason: reason,
        comment: comment,
        override: override,
        inform_vendor: informVendor,
      },
    };
    this.restService.call(req).subscribe({
      next: (res) => {
        this.toastr.success(`Successfully canceled ${poItem.number}`);
        this.cancelationQueue.splice(cancelIdx, 1);
      },
      error: (err) => {
        this.toastr.error(`Error: ${err.message}`); //TODO
      },
    });
  }
  onDeleteCancel(cancelIdx: number) {
    this.cancelationQueue.splice(cancelIdx, 1);
  }

  ifSelected = (): boolean =>
    !(this.selectDrop && this.selectDrop.selected && (this.selectDrop.selected as []).length !== 0);

  private physicalToElectronic(physicalPol: POL.Object, observables: Observable<any>[]) {
    let newPol: POL.Object = { ...physicalPol }; //Deep Copy
    newPol.type = Constants.typeMap.get(physicalPol.type.value);
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
          //TODO Nice error message
          this.toastr.error(err.message);
          return EMPTY;
        })
      )
    );
  }
}
