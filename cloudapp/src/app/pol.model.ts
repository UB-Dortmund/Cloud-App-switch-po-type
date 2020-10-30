declare module POL {
  export interface Status {
    value: string;
    desc?: string;
  }

  export interface Owner {
    value: string;
    desc?: string;
  }

  export interface Type {
    value: string;
    desc?: string;
  }

  export interface Vendor {
    value: string;
    desc?: string;
  }

  export interface AcquisitionMethod {
    value: string;
    desc?: string;
  }

  export interface Currency {
    value: string;
    desc?: string;
  }

  export interface Price {
    sum: string;
    currency: Currency;
  }

  export interface VendorReferenceNumberType {
    value: string;
  }

  export interface SourceType {
    value: string;
  }

  export interface MmsId {
    value: string;
  }

  export interface ResourceMetadata {
    mms_id: MmsId;
    title: string;
    author: string;
    issn: string;
    isbn: string;
    publisher: string;
    publication_place: string;
    publication_year: string;
    vendor_title_number: string;
    title_id: string;
    system_control_number: string[];
  }

  export interface FundCode {
    desc: string;
    value: string;
  }

  export interface FundDistribution {
    fund_code: FundCode;
    percent?: number;
    amount: number;
  }

  export interface Note {
    note_text: string;
  }

  export interface Alert {
    value: string;
    desc: string;
  }

  export interface Library {
    value: string;
  }

  export interface ItemPolicy {
    value: string;
  }

  export interface PermanentLibrary {
    value: string;
  }

  export interface Copy {
    link: string;
    barcode: string;
    item_policy: ItemPolicy;
    receive_date: string;
    enumeration_a: string;
    enumeration_b: string;
    enumeration_c: string;
    chronology_i: string;
    chronology_j: string;
    chronology_k: string;
    description: string;
    storage_location_id: string;
    is_temp_location: boolean;
    permanent_library?: PermanentLibrary;
    permanent_shelving_location: string;
  }

  export interface Location {
    quantity: number;
    library: Library;
    shelving_location: string;
    copy: Copy[];
  }

  export interface InterestedUser {
    primary_id: string;
    notify_receiving_activation?: boolean;
    hold_item?: boolean;
    notify_renewal?: boolean;
    notify_cancel?: boolean;
  }

  export interface License {
    value: string;
  }

  export interface RenewalCycle {
    value: string;
  }

  export interface MaterialType {
    value: string;
  }

  export interface Object {
    alert: Alert[];
    link: string;
    owner: Owner;
    type: Type;
    vendor: Vendor;
    status?: Status;
    vendor_account: string;
    reclaim_interval?: string;
    expected_receipt_interval: string;
    claiming_interval: string;
    expected_activation_interval: string;
    subscription_interval: string;
    expected_activation_date: string;
    e_activation_due_interval: string;
    acquisition_method: AcquisitionMethod;
    no_charge?: boolean;
    rush?: boolean;
    cancellation_restriction?: boolean;
    cancellation_restriction_note?: string;
    price: Price;
    discount: string;
    vendor_reference_number?: string;
    vendor_reference_number_type: VendorReferenceNumberType;
    source_type: SourceType;
    number?: string;
    invoice_reference?: string;
    resource_metadata: ResourceMetadata;
    fund_distribution?: FundDistribution[];
    reporting_code?: string;
    secondary_reporting_code?: string;
    tertiary_reporting_code?: string;
    vendor_note?: string;
    receiving_note?: string;
    note?: Note[];
    location: Location[];
    interested_user?: InterestedUser[];
    license: License;
    access_model: string;
    url: string;
    base_status: string;
    access_provider: string;
    manual_renewal: boolean;
    renewal_cycle: RenewalCycle;
    subscription_from_date?: Date;
    subscription_to_date?: Date;
    renewal_date: Date;
    renewal_period?: number;
    renewal_note?: string;
    material_type: MaterialType;
    expected_receipt_date: string;
  }
}
