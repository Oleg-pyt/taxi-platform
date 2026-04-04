export enum CarType {
  STANDARD = 'STANDARD',
  BUSINESS = 'BUSINESS',
  XL = 'XL'
}

export interface CarOption {
  type: CarType;
  label: string;
  description: string;
  price: number;
}

export const CAR_OPTIONS: CarOption[] = [
  {
    type: CarType.STANDARD,
    label: 'Standard',
    description: 'in 3 min',
    price: 5.99
  },
  {
    type: CarType.BUSINESS,
    label: 'Business',
    description: 'in 1 min',
    price: 9.99
  },
  {
    type: CarType.XL,
    label: 'XL',
    description: 'in 5 min',
    price: 12.99
  }
];
