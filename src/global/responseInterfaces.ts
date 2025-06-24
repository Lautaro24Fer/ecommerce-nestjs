export interface INotFoundEx {
  status: boolean;
  message: any;
}

export interface IUnauthorizedEx {
  status: boolean;
  message: string;
}

export interface IBadRequestex {
  status: boolean;
  message: any;
}

export interface IRecourseDeleted<T> {
  status: boolean;
  message: string;
  recourse: T;
}

export interface IRecourseFound<T> {
  status: boolean;
  message: string;
  recourse: T;
}

export interface IRecourseCreated<T> {
  status: boolean;
  message: string;
  recourse: T;
}

export interface IRecourseUpdated<T> {
  status: boolean;
  message: string;
  recourse: T;
}

