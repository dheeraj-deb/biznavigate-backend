export class User {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly businessName: string,
    public readonly contactPhone: string,
    public readonly contactEmail: string,
    public readonly gstin?: string,
    public readonly address?: string,
    public readonly notificationPreference?: string,
    public readonly platformId?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id: string;
    customerId: string;
    businessName: string;
    contactPhone: string;
    contactEmail: string;
    gstin?: string;
    address?: string;
    notificationPreference?: string;
    platformId?: string;
  }): User {
    return new User(
      data.id,
      data.customerId,
      data.businessName,
      data.contactPhone,
      data.contactEmail,
      data.gstin,
      data.address,
      data.notificationPreference,
      data.platformId,
    );
  }

  updateProfile(data: {
    businessName?: string;
    contactPhone?: string;
    contactEmail?: string;
    gstin?: string;
    address?: string;
    notificationPreference?: string;
  }): User {
    return new User(
      this.id,
      this.customerId,
      data.businessName ?? this.businessName,
      data.contactPhone ?? this.contactPhone,
      data.contactEmail ?? this.contactEmail,
      data.gstin ?? this.gstin,
      data.address ?? this.address,
      data.notificationPreference ?? this.notificationPreference,
      this.platformId,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.customerId,
      this.businessName,
      this.contactPhone,
      this.contactEmail,
      this.gstin,
      this.address,
      this.notificationPreference,
      this.platformId,
      false,
      this.createdAt,
      new Date(),
    );
  }
}
