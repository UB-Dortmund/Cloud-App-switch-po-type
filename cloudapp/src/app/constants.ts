export class Constants {
  //TODO Check matching and fix missing
  static typeMap: Map<string, POL.Type> = new Map([
    ["PRINTED_BOOK_OT", { value: "E_BOOK_OT", desc: "Electronic Book - One Time" }],
    ["PRINTED_BOOK_SO", { value: "E_BOOK_SO", desc: "Electronic Book - Standing Order" }],
    ["PHYSICAL_CF_OT", { value: "", desc: "" }],
    ["PHYSICAL_CF_CO", { value: "", desc: "" }],
    ["PRINTED_JOURNAL_CO", { value: "E_JOURNAL_CO", desc: "Electronic Book - One Time" }],
    ["PRINTED_JOURNAL_OT", { value: "E_JOURNAL_OT", desc: "Electronic Journal - One Time" }],
    ["PRINT_OT", { value: "", desc: "" }],
    ["PRINT_CO", { value: "", desc: "" }],
    ["PRINT_SO", { value: "ELECTRONIC_SO", desc: "Electronic Title - Standing Order" }],
    ["PRINT_SO_NONMON", { value: "", desc: "" }],
    ["PHYSICAL_ARCHIVING", { value: "", desc: "" }],
  ]);
  static physicalTypeSet: Set<string> = new Set([
    "PRINTED_BOOK_OT",
    "PRINTED_BOOK_SO",
    "PHYSICAL_CF_OT",
    "PHYSICAL_CF_CO",
    "PRINTED_JOURNAL_CO",
    "PRINTED_JOURNAL_OT",
    "PRINT_OT",
    "PRINT_CO",
    "PRINT_SO",
    "PRINT_SO_NONMON",
    "PHYSICAL_ARCHIVING",
  ]);
  static forbiddenStatuses: string[] = ["INREVIEW", "AUTO_PACKAGING"];
}
