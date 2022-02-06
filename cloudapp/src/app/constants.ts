export class Constants {
  static typeArray: [string, string][] = [
    ["PRINTED_BOOK_OT", "E_BOOK_OT"],
    ["PRINTED_BOOK_SO", "E_BOOK_SO"],
    ["PHYSICAL_CF_OT", "E_BOOK_OT"],
    ["PHYSICAL_CF_CO", "E_BOOK_CO"],
    ["PRINTED_JOURNAL_CO", "E_JOURNAL_CO"],
    ["PRINTED_JOURNAL_OT", "E_JOURNAL_OT"],
    ["PRINT_OT", "E_BOOK_OT"],
    ["PRINT_CO", "ELECTRONIC_COLLECTION_CO"],
    ["PRINT_SO", "ELECTRONIC_SO"],
    ["PRINT_SO_NONMON", "E_BOOK_OT"], // Standing order non monograph
    ["PHYSICAL_ARCHIVING", "E_BOOK_OT"],

    ["E_BOOK_OT", "PRINT_OT"],    
    ["E_BOOK_CO", "PRINT_CO"],    
    ["E_BOOK_PKG_OT", "PRINT_OT"],    
    ["E_BOOK_PKG_CO", "PRINT_CO"],    
    ["E_JOURNAL_OT", "PRINTED_JOURNAL_OT"],    
    ["E_JOURNAL_CO", "PRINTED_JOURNAL_CO"],    
    ["E_BOOK_SO", "PRINT_SO"],    
    ["E_JOURNAL_PKG_CO", "PRINTED_JOURNAL_CO"],    
    ["E_JOURNAL_PKG_OT", "PRINTED_JOURNAL_OT"],    
    ["ELECTRONIC_COLLECTION_OT", "PRINT_OT"],    
    ["ELECTRONIC_COLLECTION_CO", "PRINT_CO"],    
    ["ELECTRONIC_TITLE_OT", "PRINT_OT"],    
    ["ELECTRONIC_TITLE_CO", "PRINT_CO"],    
    ["ELECTRONIC_SO", "PRINT_SO"],    
  ];
  static typeMap: Map<string, string> = new Map(Constants.typeArray);
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
  static electronicTypeSet: Set<string> = new Set([
    "E_BOOK_OT",
    "E_BOOK_CO",
    "E_BOOK_PKG_OT",
    "E_BOOK_PKG_CO",
    "E_JOURNAL_OT",
    "E_JOURNAL_CO",
    "E_BOOK_SO",
    "E_JOURNAL_PKG_CO",
    "E_JOURNAL_PKG_OT",
    "ELECTRONIC_COLLECTION_OT",
    "ELECTRONIC_COLLECTION_CO",
    "ELECTRONIC_TITLE_OT",
    "ELECTRONIC_TITLE_CO",
    "ELECTRONIC_SO",
  ]);
  static allowedStatuses: string[] = ["INREVIEW", "AUTO_PACKAGING", "MANUAL_PACKAGING"];
}
