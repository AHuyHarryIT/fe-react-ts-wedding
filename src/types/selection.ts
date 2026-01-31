export interface SelectionItem<TExtra = unknown> {
  value: string | number;
  label: string;
  extra?: TExtra;
}

export interface SelectionPagination {
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface SelectionResponse<TExtra = unknown> {
  items: SelectionItem<TExtra>[];
  pagination: SelectionPagination;
}
