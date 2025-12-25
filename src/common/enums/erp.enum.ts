export enum ProductTrackingType {
  SIMPLE = 'SIMPLE',
  EXPIRABLE = 'EXPIRABLE',
  SERIALIZED = 'SERIALIZED',
  LOT_TRACKED = 'LOT_TRACKED',
  VARIANT = 'VARIANT',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum UserRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  ADMIN = 'ADMIN',
}
