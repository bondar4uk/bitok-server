export interface IConstructor {
  url: string;
}

export type FREQUENCIES =
  | 'minutes'
  | 'hours'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly';

export interface ILocalize {
  per: FREQUENCIES;
}
