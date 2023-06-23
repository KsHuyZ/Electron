declare module 'electron-pos-printer' {
    export interface PrinterDevice {
      name: string;
      isDefault: boolean;
    }
  
    export class Printer {
      public static getPrinters(): Promise<PrinterDevice[]>;
      // Khai báo các phương thức và kiểu dữ liệu khác nếu cần thiết
    }
  }
  