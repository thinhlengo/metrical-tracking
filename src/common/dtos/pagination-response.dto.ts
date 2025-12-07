
export class PaginationResponseDtoWithCursorDto<T> {
  data: T[];
  cursor?: string;
  direction?: 'next' | 'previous';
  total?: number;
  nextCursor?: string | null;
  previousCursor?: string | null;
  pageSize?: number;

  constructor(result: T[], total?: number, cursor?: string, direction?: 'next' | 'previous', pageSize?: number, nextCursor?: string | null, previousCursor?: string | null) {
    this.data = result;
    this.cursor = cursor;
    this.direction = direction;
    this.total = total;
    this.pageSize = pageSize;
    this.nextCursor = nextCursor;
    this.previousCursor = previousCursor;
  }
}