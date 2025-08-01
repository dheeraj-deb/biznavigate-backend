export class Customer {
  constructor(
    public readonly id: string,
    public readonly contactName: string,
    public readonly companyName: string,
    public readonly contactType: string,
    public readonly currencyId?: string,
    public readonly billingAddress?: CustomerAddress,
    public readonly shippingAddress?: CustomerAddress,
    public readonly vatRegNo?: string,
    public readonly taxRegNo?: string,
    public readonly gstNo?: string,
    public readonly businessUserId?: string,
    public readonly externalId?: string, // ID from external CRM
    public readonly platform?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id: string;
    contactName: string;
    companyName: string;
    contactType: string;
    currencyId?: string;
    billingAddress?: CustomerAddress;
    shippingAddress?: CustomerAddress;
    vatRegNo?: string;
    taxRegNo?: string;
    gstNo?: string;
    businessUserId?: string;
    platform?: string;
  }): Customer {
    return new Customer(
      data.id,
      data.contactName,
      data.companyName,
      data.contactType,
      data.currencyId,
      data.billingAddress,
      data.shippingAddress,
      data.vatRegNo,
      data.taxRegNo,
      data.gstNo,
      data.businessUserId,
      undefined, // externalId will be set after CRM creation
      data.platform,
    );
  }

  updateProfile(data: {
    contactName?: string;
    companyName?: string;
    billingAddress?: CustomerAddress;
    shippingAddress?: CustomerAddress;
    vatRegNo?: string;
    taxRegNo?: string;
    gstNo?: string;
  }): Customer {
    return new Customer(
      this.id,
      data.contactName ?? this.contactName,
      data.companyName ?? this.companyName,
      this.contactType,
      this.currencyId,
      data.billingAddress ?? this.billingAddress,
      data.shippingAddress ?? this.shippingAddress,
      data.vatRegNo ?? this.vatRegNo,
      data.taxRegNo ?? this.taxRegNo,
      data.gstNo ?? this.gstNo,
      this.businessUserId,
      this.externalId,
      this.platform,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  setExternalId(externalId: string): Customer {
    return new Customer(
      this.id,
      this.contactName,
      this.companyName,
      this.contactType,
      this.currencyId,
      this.billingAddress,
      this.shippingAddress,
      this.vatRegNo,
      this.taxRegNo,
      this.gstNo,
      this.businessUserId,
      externalId,
      this.platform,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  setCurrencyId(currencyId: string): Customer {
    return new Customer(
      this.id,
      this.contactName,
      this.companyName,
      this.contactType,
      currencyId,
      this.billingAddress,
      this.shippingAddress,
      this.vatRegNo,
      this.taxRegNo,
      this.gstNo,
      this.businessUserId,
      this.externalId,
      this.platform,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): Customer {
    return new Customer(
      this.id,
      this.contactName,
      this.companyName,
      this.contactType,
      this.currencyId,
      this.billingAddress,
      this.shippingAddress,
      this.vatRegNo,
      this.taxRegNo,
      this.gstNo,
      this.businessUserId,
      this.externalId,
      this.platform,
      false,
      this.createdAt,
      new Date(),
    );
  }
}

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
