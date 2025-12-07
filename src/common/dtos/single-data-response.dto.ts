export class SingleDataResponseDto<T> {
  data: T;

  constructor(result: T) {
    this.data = result;
  }
}