export interface Printer {
  name: string;
  status: number;
}

export interface PrintersResponse {
  printers: Printer[];
}

export function getPrinters(): Promise<PrintersResponse>;
export function print(options: PrintOptions): void;

export interface PrintOptions {
  printer: string;
  /* Other options */
}
