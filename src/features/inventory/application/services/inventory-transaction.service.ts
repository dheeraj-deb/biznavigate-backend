import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class InventoryTransactionService {
  async findProductForBusiness(tx: any, ctx: any, productId: string) {
    const product = await tx.products.findFirst({
      where: {
        product_id: productId,
        business_id: ctx.businessId,
        tenant_id: ctx.tenantId,
        product_type: 'physical',
        is_active: true,
      },
      include: { product_variants: true },
    });

    if (!product) throw new NotFoundException('Product not found for this seller');
    return product;
  }

  async reserveProductStock(tx: any, product: any, variantId: string | undefined, quantity: number) {
    this.assertPositiveQuantity(quantity);

    if (variantId) {
      const variant = await this.lockVariantStock(tx, product.product_id, variantId);
      const available = this.availableStock(variant.quantity, variant.reserved_stock);
      if (available < quantity) throw new ConflictException(`Only ${available} unit(s) available`);

      await tx.product_variants.update({
        where: { variant_id: variantId },
        data: {
          reserved_stock: { increment: quantity },
          version: { increment: 1 },
          updated_at: new Date(),
        },
      });

      return {
        scope: 'variant',
        product_id: product.product_id,
        variant_id: variantId,
        quantity,
        available_before: available,
        reserved_before: Number(variant.reserved_stock || 0),
        reserved_after: Number(variant.reserved_stock || 0) + quantity,
      };
    }

    const row = await this.lockProductStock(tx, product.product_id);
    const available = this.availableStock(row.stock_quantity, row.reserved_stock);
    if (available < quantity) throw new ConflictException(`Only ${available} unit(s) available`);

    await tx.products.update({
      where: { product_id: product.product_id },
      data: {
        reserved_stock: { increment: quantity },
        version: { increment: 1 },
        updated_at: new Date(),
      },
    });

    return {
      scope: 'product',
      product_id: product.product_id,
      quantity,
      available_before: available,
      reserved_before: Number(row.reserved_stock || 0),
      reserved_after: Number(row.reserved_stock || 0) + quantity,
    };
  }

  async releaseReservedProductStock(
    tx: any,
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) {
    this.assertPositiveQuantity(quantity);

    if (variantId) {
      const variant = await this.lockVariantStock(tx, productId, variantId);
      const reservedBefore = Number(variant.reserved_stock || 0);
      const releaseQuantity = Math.min(reservedBefore, quantity);

      if (releaseQuantity > 0) {
        await tx.product_variants.update({
          where: { variant_id: variantId },
          data: {
            reserved_stock: { decrement: releaseQuantity },
            version: { increment: 1 },
            updated_at: new Date(),
          },
        });
      }

      return {
        scope: 'variant',
        product_id: productId,
        variant_id: variantId,
        quantity: releaseQuantity,
        reserved_before: reservedBefore,
        reserved_after: reservedBefore - releaseQuantity,
      };
    }

    const row = await this.lockProductStock(tx, productId);
    const reservedBefore = Number(row.reserved_stock || 0);
    const releaseQuantity = Math.min(reservedBefore, quantity);

    if (releaseQuantity > 0) {
      await tx.products.update({
        where: { product_id: productId },
        data: {
          reserved_stock: { decrement: releaseQuantity },
          version: { increment: 1 },
          updated_at: new Date(),
        },
      });
    }

    return {
      scope: 'product',
      product_id: productId,
      quantity: releaseQuantity,
      reserved_before: reservedBefore,
      reserved_after: reservedBefore - releaseQuantity,
    };
  }

  async sellProductStock(tx: any, product: any, variantId: string | undefined, quantity: number) {
    this.assertPositiveQuantity(quantity);

    if (variantId) {
      const variant = await this.lockVariantStock(tx, product.product_id, variantId);
      const available = this.availableStock(variant.quantity, variant.reserved_stock);
      if (available < quantity) throw new ConflictException(`Only ${available} unit(s) available`);

      const newQuantity = Number(variant.quantity || 0) - quantity;
      await tx.product_variants.update({
        where: { variant_id: variantId },
        data: {
          quantity: newQuantity,
          in_stock: newQuantity > 0,
          version: { increment: 1 },
          updated_at: new Date(),
        },
      });

      return {
        scope: 'variant',
        product_id: product.product_id,
        variant_id: variantId,
        quantity,
        available_before: available,
        stock_before: Number(variant.quantity || 0),
        stock_after: newQuantity,
      };
    }

    const row = await this.lockProductStock(tx, product.product_id);
    const available = this.availableStock(row.stock_quantity, row.reserved_stock);
    if (available < quantity) throw new ConflictException(`Only ${available} unit(s) available`);

    const newStock = Number(row.stock_quantity || 0) - quantity;
    await tx.products.update({
      where: { product_id: product.product_id },
      data: {
        stock_quantity: newStock,
        in_stock: newStock > 0,
        version: { increment: 1 },
        updated_at: new Date(),
      },
    });

    return {
      scope: 'product',
      product_id: product.product_id,
      quantity,
      available_before: available,
      stock_before: Number(row.stock_quantity || 0),
      stock_after: newStock,
    };
  }

  async convertActiveHoldForSale(
    tx: any,
    ctx: any,
    item: any,
    customerPhone: string,
    leadId?: string,
  ): Promise<boolean> {
    this.assertPositiveQuantity(item.quantity);

    const reservation = await tx.seller_stock_reservations.findFirst({
      where: {
        business_id: ctx.businessId,
        product_id: item.product_id,
        variant_id: item.variant_id,
        status: 'active',
        quantity: { gte: item.quantity },
        OR: [
          leadId ? { lead_id: leadId } : undefined,
          customerPhone ? { customer_phone: customerPhone } : undefined,
        ].filter(Boolean),
      },
      orderBy: { expires_at: 'asc' },
    });

    if (!reservation) return false;

    await this.releaseReservedProductStock(tx, item.product_id, item.variant_id, item.quantity);
    await this.decrementTotalStock(tx, item.product_id, item.variant_id, item.quantity);

    if (Number(reservation.quantity || 0) > Number(item.quantity || 0)) {
      await tx.seller_stock_reservations.update({
        where: { seller_reservation_id: reservation.seller_reservation_id },
        data: {
          quantity: { decrement: item.quantity },
          metadata: {
            ...(reservation.metadata || {}),
            partial_sale_at: new Date().toISOString(),
            partial_sale_quantity: item.quantity,
          },
          updated_at: new Date(),
        },
      });
    } else {
      await tx.seller_stock_reservations.update({
        where: { seller_reservation_id: reservation.seller_reservation_id },
        data: {
          status: 'converted',
          updated_at: new Date(),
        },
      });
    }

    return true;
  }

  async convertLinkedHoldToSale(tx: any, hold: any) {
    this.assertPositiveQuantity(hold.quantity);

    await this.releaseReservedProductStock(tx, hold.product_id, hold.variant_id, hold.quantity);
    await this.decrementTotalStock(tx, hold.product_id, hold.variant_id, hold.quantity, true);

    return tx.seller_stock_reservations.update({
      where: { seller_reservation_id: hold.seller_reservation_id },
      data: {
        status: 'converted',
        released_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async releaseLinkedHold(tx: any, hold: any, status = 'released') {
    this.assertPositiveQuantity(hold.quantity);

    await this.releaseReservedProductStock(tx, hold.product_id, hold.variant_id, hold.quantity);
    return tx.seller_stock_reservations.update({
      where: { seller_reservation_id: hold.seller_reservation_id },
      data: {
        status,
        released_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async restoreStockForUnpaidOrder(tx: any, order: any) {
    if (order.source === 'payment_desk') return;

    for (const item of order.order_items || []) {
      this.assertPositiveQuantity(item.quantity);

      if (item.variant_id) {
        await tx.product_variants.update({
          where: { variant_id: item.variant_id },
          data: {
            quantity: { increment: item.quantity },
            in_stock: true,
            version: { increment: 1 },
            updated_at: new Date(),
          },
        });
      } else if (item.product_id) {
        await tx.products.update({
          where: { product_id: item.product_id },
          data: {
            stock_quantity: { increment: item.quantity },
            in_stock: true,
            version: { increment: 1 },
            updated_at: new Date(),
          },
        });
      }
    }
  }

  private async decrementTotalStock(
    tx: any,
    productId: string,
    variantId: string | undefined,
    quantity: number,
    clampAtZero = false,
  ) {
    if (variantId) {
      const variant = await this.lockVariantStock(tx, productId, variantId);
      const stockBefore = Number(variant.quantity || 0);
      if (!clampAtZero && stockBefore < quantity) {
        throw new ConflictException(`Only ${stockBefore} unit(s) available`);
      }
      const newQuantity = clampAtZero ? Math.max(0, stockBefore - quantity) : stockBefore - quantity;
      await tx.product_variants.update({
        where: { variant_id: variantId },
        data: {
          quantity: newQuantity,
          in_stock: newQuantity > 0,
          version: { increment: 1 },
          updated_at: new Date(),
        },
      });
      return;
    }

    const row = await this.lockProductStock(tx, productId);
    const stockBefore = Number(row.stock_quantity || 0);
    if (!clampAtZero && stockBefore < quantity) {
      throw new ConflictException(`Only ${stockBefore} unit(s) available`);
    }
    const newStock = clampAtZero ? Math.max(0, stockBefore - quantity) : stockBefore - quantity;
    await tx.products.update({
      where: { product_id: productId },
      data: {
        stock_quantity: newStock,
        in_stock: newStock > 0,
        version: { increment: 1 },
        updated_at: new Date(),
      },
    });
  }

  private async lockProductStock(tx: any, productId: string) {
    const rows = (await tx.$queryRaw(
      Prisma.sql`
        SELECT stock_quantity, COALESCE(reserved_stock, 0) AS reserved_stock
        FROM products
        WHERE product_id = ${productId}::uuid
        FOR UPDATE
      `,
    )) as any[];
    const row = rows[0];
    if (!row) throw new NotFoundException('Product not found');
    return row;
  }

  private async lockVariantStock(tx: any, productId: string, variantId: string) {
    const rows = (await tx.$queryRaw(
      Prisma.sql`
        SELECT pv.variant_id, pv.quantity, COALESCE(pv.reserved_stock, 0) AS reserved_stock
        FROM product_variants pv
        JOIN products p ON p.product_id = pv.product_id
        WHERE pv.variant_id = ${variantId}::uuid
          AND p.product_id = ${productId}::uuid
        FOR UPDATE
      `,
    )) as any[];
    const variant = rows[0];
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }

  private availableStock(stockQuantity: number | null | undefined, reservedStock: number | null | undefined) {
    return Number(stockQuantity || 0) - Number(reservedStock || 0);
  }

  private assertPositiveQuantity(quantity: number) {
    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }
  }
}
