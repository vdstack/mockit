import { z } from "zod";
import { m } from "../..";

function hi(): any {}

test("thenReturn should accept a basic a m.any matcher and return a corresponding object", () => {
  const mock = m.Mock(hi);
  m.when(mock).isCalled.thenReturn(m.anyArray());
  expect(Array.isArray(mock())).toBe(true);

  m.when(mock).isCalled.thenReturn(m.anyBoolean());
  expect(typeof mock()).toBe("boolean");

  m.when(mock).isCalled.thenReturn(m.anyNumber());
  expect(typeof mock()).toBe("number");

  m.when(mock).isCalled.thenReturn(m.anyObject());
  expect(typeof mock()).toBe("object");

  m.when(mock).isCalled.thenReturn(m.anyString());
  expect(typeof mock()).toBe("string");

  m.when(mock).isCalled.thenReturn(m.anyFunction());
  expect(typeof mock()).toBe("function");

  m.when(mock).isCalled.thenReturn(m.anyMap());
  expect(mock()).toBeInstanceOf(Map);

  m.when(mock).isCalled.thenReturn(m.anySet());
  expect(mock()).toBeInstanceOf(Set);

  m.when(mock).isCalled.thenReturn(m.anyNullish());
  const nullishResult = mock();
  expect(nullishResult === undefined || nullishResult === null).toBe(true);

  m.when(mock).isCalled.thenReturn(m.anyFalsy());
  const falsyResult = mock();
  expect(!falsyResult).toBe(true);

  m.when(mock).isCalled.thenReturn(m.anyTruthy());
  const truthyResult = mock();
  expect(!!truthyResult).toBeTruthy();
});

test("objectMatching", () => {
  const mock = m.Mock(hi);
  m.when(mock).isCalled.thenReturn(
    m.objectMatching({
      name: "azeaze",
      coordinates: {
        lat: m.anyNumber(),
        lng: m.anyNumber(),
        city: m.anyString(),
      },
    })
  );

  const result = mock();
  expect(result).toEqual({
    name: "azeaze",
    coordinates: {
      lat: expect.any(Number),
      lng: expect.any(Number),
      city: expect.any(String),
    },
  });
});

test("arrayMatching", () => {
  const mock = m.Mock(hi);
  m.when(mock).isCalled.thenReturn(m.anyArray());
  const result = mock();
  expect(Array.isArray(result)).toBe(true);

  m.when(mock).isCalled.thenReturn(m.arrayMatching([m.anyString()]));
  const result2 = mock();
  expect(result2).toEqual([expect.any(String)]);
});

interface User {
  id: string;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
  };
}

interface IUserService {
  getUser(id: string): Promise<User>;
}

test("automatic mock data with m.validates and zod", async () => {
  const mockUserService = m.Mock<IUserService>();
  m.when(mockUserService.getUser).isCalled.thenReturn(
    m.objectMatching({
      id: m.validates(z.string().uuid()),
    })
  );
  const user = await mockUserService.getUser("123");
  expect(user.id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
});

const reviewSchema = z.object({
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  createdAt: z.date(),
});

const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  inStock: z.boolean(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  reviews: z.array(reviewSchema),
  details: z.object({
    manufacturer: z.string(),
    modelNumber: z.string(),
    releaseDate: z.date().optional(),
    dimensions: z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      depth: z.number().positive(),
    }),
  }),
  relatedProducts: z.array(z.any()), //We don't care in this example
});

type Product = z.infer<typeof productSchema>;

interface IProductService {
  getProduct(id: string): Promise<Product>;
}

async function getProductSizing(
  productID: string,
  productService: IProductService
) {
  const product = await productService.getProduct(productID);
  const volume =
    product.details.dimensions.width *
    product.details.dimensions.height *
    product.details.dimensions.depth;

  const category = volume > 1000 ? "large" : "small";
  return {
    volume,
    category,
    ...product.details.dimensions,
  };
}

test("automatic mock data with zod", async () => {
  const mockProductService = m.Mock<IProductService>();
  m.when(mockProductService.getProduct).isCalled.thenReturn(
    m.validates(productSchema)
  );

  const sizing = await getProductSizing("123", mockProductService);
  m.expect(sizing).toMatch({
    volume: sizing.width * sizing.height * sizing.depth,
    category: m.validates(z.enum(["large", "small"])),
  });
});
