import bcrypt from "bcryptjs";
import { getSupabase } from "./supabase";
import type { Product, InsertProduct, User, InsertUser, SafeUser } from "./schema";

// ── Helpers: map DB snake_case → app camelCase ──────────
interface DbProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  low_stock_threshold: number;
  description: string | null;
}

interface DbUser {
  id: string;
  username: string;
  password: string;
  full_name: string;
  rank: string;
  unit: string;
  callsign: string | null;
  clearance_level: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
}

function dbToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    quantity: row.quantity,
    price: Number(row.price),
    lowStockThreshold: row.low_stock_threshold,
    description: row.description,
  };
}

function dbToUser(row: DbUser): User {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    fullName: row.full_name,
    rank: row.rank,
    unit: row.unit,
    callsign: row.callsign,
    clearanceLevel: row.clearance_level,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  };
}

function toSafeUser(user: User): SafeUser {
  const { password: _, ...safe } = user;
  return safe;
}

// ── Supabase Storage ─────────────────────────────────────
class SupabaseStorage {
  private get db() {
    return getSupabase();
  }

  // ── Products ──────────────────────────────────────────
  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.db
      .from("products")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data as DbProduct[]).map(dbToProduct);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const { data, error } = await this.db
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return undefined;
    return dbToProduct(data as DbProduct);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const { data, error } = await this.db
      .from("products")
      .select("*")
      .eq("sku", sku)
      .single();
    if (error) return undefined;
    return dbToProduct(data as DbProduct);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const { data, error } = await this.db
      .from("products")
      .insert({
        name: insertProduct.name,
        sku: insertProduct.sku,
        category: insertProduct.category,
        quantity: insertProduct.quantity,
        price: insertProduct.price,
        low_stock_threshold: insertProduct.lowStockThreshold,
        description: insertProduct.description ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return dbToProduct(data as DbProduct);
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    // Map camelCase → snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = updates.lowStockThreshold;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { data, error } = await this.db
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return undefined;
    return dbToProduct(data as DbProduct);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await this.db
      .from("products")
      .delete()
      .eq("id", id);
    return !error;
  }

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    let q = this.db.from("products").select("*");

    if (query) {
      const search = `%${query}%`;
      q = q.or(`name.ilike.${search},sku.ilike.${search},description.ilike.${search}`);
    }
    if (category && category !== "all") {
      q = q.eq("category", category);
    }

    const { data, error } = await q.order("name");
    if (error) throw error;
    return (data as DbProduct[]).map(dbToProduct);
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await this.db
      .from("products")
      .select("category");
    if (error) throw error;
    const categories = new Set<string>();
    for (const row of data as { category: string }[]) {
      categories.add(row.category);
    }
    return Array.from(categories).sort();
  }

  async getStats() {
    const { data, error } = await this.db
      .from("products")
      .select("*");
    if (error) throw error;
    const products = (data as DbProduct[]).map(dbToProduct);
    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
      lowStockCount: products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length,
      outOfStockCount: products.filter((p) => p.quantity === 0).length,
      categoriesCount: new Set(products.map((p) => p.category)).size,
    };
  }

  // ── Users ─────────────────────────────────────────────
  async getUsers(): Promise<SafeUser[]> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .order("created_at");
    if (error) throw error;
    return (data as DbUser[]).map(dbToUser).map(toSafeUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return undefined;
    return dbToUser(data as DbUser);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .ilike("username", username)
      .single();
    if (error) return undefined;
    return dbToUser(data as DbUser);
  }

  async createUser(insertUser: InsertUser): Promise<SafeUser> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const { data, error } = await this.db
      .from("users")
      .insert({
        username: insertUser.username,
        password: hashedPassword,
        full_name: insertUser.fullName,
        rank: insertUser.rank,
        unit: insertUser.unit,
        callsign: insertUser.callsign ?? null,
        clearance_level: insertUser.clearanceLevel ?? "Без допуску",
        role: insertUser.role ?? "user",
        is_active: insertUser.isActive ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return toSafeUser(dbToUser(data as DbUser));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<SafeUser | undefined> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.rank !== undefined) dbUpdates.rank = updates.rank;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.callsign !== undefined) dbUpdates.callsign = updates.callsign ?? null;
    if (updates.clearanceLevel !== undefined) dbUpdates.clearance_level = updates.clearanceLevel;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.password !== undefined) {
      dbUpdates.password = await bcrypt.hash(updates.password, 10);
    }

    const { data, error } = await this.db
      .from("users")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return undefined;
    return toSafeUser(dbToUser(data as DbUser));
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await this.db
      .from("users")
      .delete()
      .eq("id", id);
    return !error;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}

export const storage = new SupabaseStorage();
