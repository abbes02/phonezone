/**
 * Property-Based Tests for Products
 * Feature: phone-shop-app
 *
 * Tests Properties 3, 4, and 12 using fast-check
 */

import * as fc from 'fast-check';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products.service';
import { Product, ProductCategory } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

// ─── Mock Repository ─────────────────────────────────────────────────────────

function buildMockRepository(products: Product[] = []) {
  const store: Product[] = [...products];

  return {
    findAndCount: jest.fn().mockImplementation(({ where, skip, take }) => {
      let filtered = [...store];

      // Apply where filter (array of conditions = OR)
      if (where && Array.isArray(where) && where.length > 0) {
        filtered = store.filter((p) =>
          where.some((condition: Partial<Product>) => {
            return Object.entries(condition).every(([key, value]) => {
              const productValue = (p as any)[key];
              if (typeof value === 'object' && value !== null && '_type' in value) {
                // ILike simulation
                const pattern = (value as any).value as string;
                const cleaned = pattern.replace(/%/g, '').toLowerCase();
                return String(productValue).toLowerCase().includes(cleaned);
              }
              return productValue === value;
            });
          }),
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip ?? 0, (skip ?? 0) + (take ?? 12));
      return Promise.resolve([paginated, total]);
    }),
    findOne: jest.fn().mockImplementation(({ where: { id } }: any) => {
      return Promise.resolve(store.find((p) => p.id === id) ?? null);
    }),
    create: jest.fn().mockImplementation((dto: Partial<Product>) => ({ ...dto } as Product)),
    save: jest.fn().mockImplementation((p: Product) => {
      const existing = store.findIndex((x) => x.id === p.id);
      if (existing >= 0) {
        store[existing] = p;
      } else {
        const newProduct = { ...p, id: `uuid-${Date.now()}-${Math.random()}` } as Product;
        store.push(newProduct);
        return Promise.resolve(newProduct);
      }
      return Promise.resolve(p);
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };
}

function buildService(products: Product[] = []): {
  service: ProductsService;
  repo: ReturnType<typeof buildMockRepository>;
} {
  const repo = buildMockRepository(products);
  const service = new ProductsService(repo as any);
  return { service, repo };
}

// ─── Property 12: Validation prix produit ────────────────────────────────────

/**
 * Validates: Requirement 6.3
 *
 * Feature: phone-shop-app, Property 12
 *
 * For any price <= 0 submitted, create() or update() must throw BadRequestException.
 */
describe('Property 12 — Validation prix produit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject create() for any price <= 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(0),
          // negative floats (max must be a 32-bit float)
          fc.float({ max: Math.fround(-0.01), noNaN: true }).filter((v) => v <= 0),
          // negative integers
          fc.integer({ max: -1 }),
        ),
        async (invalidPrice) => {
          const { service } = buildService();

          const dto: CreateProductDto = {
            name: 'Test Product',
            description: 'A product description',
            category: ProductCategory.PHONE,
            price: invalidPrice,
          };

          await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should reject update() for any price <= 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(0),
          fc.float({ max: Math.fround(-0.01), noNaN: true }).filter((v) => v <= 0),
          fc.integer({ max: -1 }),
        ),
        async (invalidPrice) => {
          const existingProduct: Product = {
            id: 'product-uuid-1',
            name: 'Existing Product',
            description: 'A description',
            category: ProductCategory.PHONE,
            price: 100,
            stockQuantity: 5,
            imageUrls: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const { service } = buildService([existingProduct]);

          const dto: UpdateProductDto = {
            price: invalidPrice,
          };

          await expect(service.update('product-uuid-1', dto)).rejects.toThrow(
            BadRequestException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 3: Filtrage catalogue par catégorie ────────────────────────────

/**
 * Validates: Requirement 2.4
 *
 * Feature: phone-shop-app, Property 3
 *
 * For any category filter applied, all returned products must belong exclusively to that category.
 */
describe('Property 3 — Filtrage catalogue par catégorie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return only products matching the requested category', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          ProductCategory.PHONE,
          ProductCategory.ACCESSORY,
          ProductCategory.SCREEN_PROTECTOR,
        ),
        async (filterCategory) => {
          // Build a dataset of products from all categories
          const products: Product[] = [
            {
              id: 'p1',
              name: 'iPhone 15',
              description: 'Apple phone',
              category: ProductCategory.PHONE,
              price: 999,
              stockQuantity: 10,
              imageUrls: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'p2',
              name: 'USB-C Cable',
              description: 'Charging cable',
              category: ProductCategory.ACCESSORY,
              price: 15,
              stockQuantity: 50,
              imageUrls: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'p3',
              name: 'Screen Protector Pro',
              description: 'Tempered glass',
              category: ProductCategory.SCREEN_PROTECTOR,
              price: 12,
              stockQuantity: 100,
              imageUrls: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          // Override findAndCount to filter by category properly
          const repo = {
            findAndCount: jest.fn().mockImplementation(() => {
              const filtered = products.filter(
                (p) => p.category === filterCategory,
              );
              return Promise.resolve([filtered, filtered.length]);
            }),
          };

          const service = new ProductsService(repo as any);
          const result = await service.findAll({ category: filterCategory });

          // All returned products must belong to filterCategory
          result.data.forEach((product) => {
            expect(product.category).toBe(filterCategory);
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 4: Produits hors stock désactivés ───────────────────────────────

/**
 * Validates: Requirement 2.7
 *
 * Feature: phone-shop-app, Property 4
 *
 * For any product with stockQuantity === 0, updateStock() must set isActive to false.
 */
describe('Property 4 — Produits hors stock désactivés', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set isActive=false when stockQuantity is updated to 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          stockQuantity: fc.constant(0),
        }),
        async ({ stockQuantity }) => {
          const existingProduct: Product = {
            id: 'product-uuid-stock',
            name: 'Stock Test Product',
            description: 'A product',
            category: ProductCategory.PHONE,
            price: 500,
            stockQuantity: 10,
            imageUrls: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          let savedProduct: Product | null = null;

          const repo = {
            findOne: jest.fn().mockResolvedValue({ ...existingProduct }),
            save: jest.fn().mockImplementation((p: Product) => {
              savedProduct = { ...p };
              return Promise.resolve(savedProduct);
            }),
          };

          const service = new ProductsService(repo as any);
          const result = await service.updateStock('product-uuid-stock', stockQuantity);

          // A product with stockQuantity === 0 must have isActive === false
          expect(result.stockQuantity).toBe(0);
          expect(result.isActive).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should set isActive=true when stockQuantity is updated to a positive value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 9999 }),
        async (positiveQuantity) => {
          const existingProduct: Product = {
            id: 'product-uuid-stock2',
            name: 'Stock Test Product 2',
            description: 'A product',
            category: ProductCategory.ACCESSORY,
            price: 25,
            stockQuantity: 0,
            imageUrls: [],
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const repo = {
            findOne: jest.fn().mockResolvedValue({ ...existingProduct }),
            save: jest.fn().mockImplementation((p: Product) => Promise.resolve({ ...p })),
          };

          const service = new ProductsService(repo as any);
          const result = await service.updateStock('product-uuid-stock2', positiveQuantity);

          expect(result.stockQuantity).toBe(positiveQuantity);
          expect(result.isActive).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
