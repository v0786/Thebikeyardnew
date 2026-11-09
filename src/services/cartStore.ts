import { Motorcycle } from '../types';
import { AccessoryItem } from '../data/dealershipData';

export interface CartItem {
  id: string;
  type: 'BIKE_ADVANCE' | 'ACCESSORY';
  title: string;
  subtitle?: string;
  pricePaise: bigint;
  quantity: number;
  image: string;
  bikeRef?: Motorcycle;
  accessoryRef?: AccessoryItem;
}

class CartStore {
  private items: CartItem[] = [];
  private listeners: Set<() => void> = new Set();

  public getItems(): CartItem[] {
    return this.items;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public addBikeBooking(bike: Motorcycle, advanceAmountPaise = 1000000n, selectedColor = 'Standard') {
    const existing = this.items.find((i) => i.id === `bike-${bike.id}`);
    if (existing) {
      existing.pricePaise = advanceAmountPaise;
      existing.subtitle = `Colour: ${selectedColor} · Model: ${bike.variant}`;
    } else {
      this.items.push({
        id: `bike-${bike.id}`,
        type: 'BIKE_ADVANCE',
        title: `${bike.brand} ${bike.model} (Booking Advance)`,
        subtitle: `Colour: ${selectedColor} · MH-04 Thane Delivery`,
        pricePaise: advanceAmountPaise,
        quantity: 1,
        image: bike.image,
        bikeRef: bike,
      });
    }
    this.notify();
  }

  public addAccessory(acc: AccessoryItem) {
    const existing = this.items.find((i) => i.id === `acc-${acc.id}`);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        id: `acc-${acc.id}`,
        type: 'ACCESSORY',
        title: acc.name,
        subtitle: `${acc.category} · Authorized OEM Accessory`,
        pricePaise: acc.pricePaise,
        quantity: 1,
        image: acc.image,
        accessoryRef: acc,
      });
    }
    this.notify();
  }

  public removeItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
    this.notify();
  }

  public updateQuantity(id: string, delta: number) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(id);
    } else {
      this.notify();
    }
  }

  public clearCart() {
    this.items = [];
    this.notify();
  }

  public getTotalPaise(): bigint {
    return this.items.reduce((sum, item) => sum + item.pricePaise * BigInt(item.quantity), 0n);
  }

  public getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

export const cartStore = new CartStore();
