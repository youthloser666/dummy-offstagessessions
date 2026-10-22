/**
 * Shopify Storefront API Client & Utilities
 * Integrated for Headless E-Commerce in Offstage Sessions
 */

const SHOPIFY_STORE_DOMAIN =
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'z6sevy-0z.myshopify.com';

const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    '04c149092eea9721b6b19d2ca6713be2';

const SHOPIFY_API_VERSION =
    process.env.SHOPIFY_STOREFRONT_API_VERSION || '2024-07';

export interface ShopifyImage {
    url: string;
    altText?: string | null;
}

export interface ShopifyPrice {
    amount: string;
    currencyCode: string;
}

export interface ShopifyVariant {
    id: string;
    title: string;
    availableForSale: boolean;
    price: ShopifyPrice;
    selectedOptions: {
        name: string;
        value: string;
    }[];
}

export interface ShopifyProductNode {
    id: string;
    title: string;
    handle: string;
    description: string;
    availableForSale: boolean;
    tags: string[];
    priceRange: {
        minVariantPrice: ShopifyPrice;
    };
    images: {
        edges: {
            node: ShopifyImage;
        }[];
    };
    variants: {
        edges: {
            node: ShopifyVariant;
        }[];
    };
}

export interface FormattedProduct {
    id: string;
    shopifyId: string;
    name: string;
    handle: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    hoverImage?: string;
    category: string;
    sizes: string[];
    variantMap: {
        [key: string]: {
            id: string;
            title: string;
            price: number;
            available: boolean;
        };
    };
    defaultVariantId: string;
    availableForSale: boolean;
    badge?: string;
}

export interface CartLine {
    id: string;
    variantId?: string;
    quantity: number;
    title: string;
    productTitle: string;
    price: number;
    currency?: string;
    image?: string;
}

export interface CartResult {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    subtotal?: number;
    currency?: string;
    lines: CartLine[];
}

/**
 * Generic Fetcher for Shopify GraphQL API
 */
export async function shopifyFetch<T>({
    query,
    variables = {},
    cache = 'no-store',
}: {
    query: string;
    variables?: Record<string, unknown>;
    cache?: RequestCache;
}): Promise<T> {
    const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query, variables }),
            cache,
        });

        if (!response.ok) {
            throw new Error(`Shopify API responded with status ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();

        if (json.errors) {
            console.error('Shopify GraphQL Errors:', json.errors);
            throw new Error(json.errors[0]?.message || 'Shopify GraphQL query failed');
        }

        return json.data as T;
    } catch (error) {
        console.error('Error connecting to Shopify Storefront API:', error);
        throw error;
    }
}

const PRODUCTS_QUERY = `
  query getProducts($first: Int = 50) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 25) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch and format all products from Shopify
 */
export async function getShopifyProducts(limit = 50): Promise<FormattedProduct[]> {
    try {
        const data = await shopifyFetch<{
            products: { edges: { node: ShopifyProductNode }[] };
        }>({
            query: PRODUCTS_QUERY,
            variables: { first: limit },
        });

        const products = data.products.edges.map(({ node }) => {
            const images = node.images.edges.map((e) => e.node.url);
            const mainImage =
                images[0] ||
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800';
            const hoverImage = images.length > 1 ? images[1] : undefined;

            const variants = node.variants.edges.map((e) => e.node);
            const variantMap: FormattedProduct['variantMap'] = {};
            const sizes: string[] = [];

            variants.forEach((v) => {
                const displayTitle = v.title === 'Default Title' ? 'One Size' : v.title;
                sizes.push(displayTitle);
                variantMap[displayTitle] = {
                    id: v.id,
                    title: displayTitle,
                    price: parseFloat(v.price.amount),
                    available: v.availableForSale,
                };
            });

            // Derive badge
            let badge: string | undefined = undefined;
            if (!node.availableForSale) {
                badge = 'Sold Out';
            } else if (node.tags.includes('Limited') || node.tags.includes('limited')) {
                badge = 'Limited';
            } else if (node.tags.includes('New') || node.tags.includes('new')) {
                badge = 'New';
            }

            // Derive category from tags or default
            const categoryTag = node.tags.find((t) =>
                ['Tees', 'Headwear', 'Sweatshirts', 'Accessories', 'Apparel'].includes(t)
            );
            const category = categoryTag || 'Apparel';

            return {
                id: node.id,
                shopifyId: node.id,
                name: node.title,
                handle: node.handle,
                description: node.description,
                price: parseFloat(node.priceRange.minVariantPrice.amount),
                currency: node.priceRange.minVariantPrice.currencyCode,
                image: mainImage,
                hoverImage,
                category,
                sizes,
                variantMap,
                defaultVariantId: variants[0]?.id || '',
                availableForSale: node.availableForSale,
                badge,
            };
        });

        return products;
    } catch (error) {
        console.error('Failed to get Shopify products:', error);
        return [];
    }
}

const CART_FRAGMENT = `
  fragment CartDetails on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                title
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

function formatShopifyCart(rawCart: any): CartResult {
    const lines: CartLine[] = (rawCart.lines?.edges || []).map((edge: any) => {
        const node = edge.node;
        const merchandise = node.merchandise || {};
        return {
            id: node.id,
            variantId: merchandise.id,
            quantity: node.quantity,
            title: merchandise.title === 'Default Title' ? 'One Size' : merchandise.title || '',
            productTitle: merchandise.product?.title || '',
            price: parseFloat(merchandise.price?.amount || '0'),
            currency: merchandise.price?.currencyCode || 'USD',
            image: merchandise.image?.url || '',
        };
    });

    return {
        id: rawCart.id,
        checkoutUrl: rawCart.checkoutUrl,
        totalQuantity: rawCart.totalQuantity,
        subtotal: parseFloat(rawCart.cost?.subtotalAmount?.amount || rawCart.cost?.totalAmount?.amount || '0'),
        currency: rawCart.cost?.subtotalAmount?.currencyCode || 'USD',
        lines,
    };
}

const CREATE_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create a new cart and return formatted CartResult
 */
export async function createShopifyCart(
    variantId: string,
    quantity = 1
): Promise<CartResult> {
    const data = await shopifyFetch<{
        cartCreate: {
            cart: any;
            userErrors: { field: string; message: string }[];
        };
    }>({
        query: CREATE_CART_MUTATION,
        variables: {
            input: {
                lines: [
                    {
                        merchandiseId: variantId,
                        quantity,
                    },
                ],
            },
        },
    });

    if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
        throw new Error(data.cartCreate.userErrors[0].message);
    }

    return formatShopifyCart(data.cartCreate.cart);
}

const ADD_TO_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Add items to an existing cart
 */
export async function addToShopifyCart(
    cartId: string,
    variantId: string,
    quantity = 1
): Promise<CartResult> {
    const data = await shopifyFetch<{
        cartLinesAdd: {
            cart: any;
            userErrors: { field: string; message: string }[];
        };
    }>({
        query: ADD_TO_CART_MUTATION,
        variables: {
            cartId,
            lines: [
                {
                    merchandiseId: variantId,
                    quantity,
                },
            ],
        },
    });

    if (data.cartLinesAdd.userErrors && data.cartLinesAdd.userErrors.length > 0) {
        throw new Error(data.cartLinesAdd.userErrors[0].message);
    }

    return formatShopifyCart(data.cartLinesAdd.cart);
}

const REMOVE_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Remove items from cart
 */
export async function removeFromShopifyCart(
    cartId: string,
    lineIds: string[]
): Promise<CartResult> {
    const data = await shopifyFetch<{
        cartLinesRemove: {
            cart: any;
            userErrors: { field: string; message: string }[];
        };
    }>({
        query: REMOVE_CART_LINES_MUTATION,
        variables: {
            cartId,
            lineIds,
        },
    });

    if (data.cartLinesRemove.userErrors && data.cartLinesRemove.userErrors.length > 0) {
        throw new Error(data.cartLinesRemove.userErrors[0].message);
    }

    return formatShopifyCart(data.cartLinesRemove.cart);
}

const UPDATE_CART_LINES_MUTATION = `
  ${CART_FRAGMENT}
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Update quantity of an item in cart
 */
export async function updateShopifyCartLine(
    cartId: string,
    lineId: string,
    quantity: number
): Promise<CartResult> {
    const data = await shopifyFetch<{
        cartLinesUpdate: {
            cart: any;
            userErrors: { field: string; message: string }[];
        };
    }>({
        query: UPDATE_CART_LINES_MUTATION,
        variables: {
            cartId,
            lines: [{ id: lineId, quantity }],
        },
    });

    if (data.cartLinesUpdate.userErrors && data.cartLinesUpdate.userErrors.length > 0) {
        throw new Error(data.cartLinesUpdate.userErrors[0].message);
    }

    return formatShopifyCart(data.cartLinesUpdate.cart);
}

const GET_CART_QUERY = `
  ${CART_FRAGMENT}
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartDetails
    }
  }
`;

/**
 * Get an existing cart by ID
 */
export async function getShopifyCart(cartId: string): Promise<CartResult | null> {
    try {
        const data = await shopifyFetch<{
            cart: any;
        }>({
            query: GET_CART_QUERY,
            variables: { cartId },
        });

        if (!data.cart) return null;
        return formatShopifyCart(data.cart);
    } catch (err) {
        console.error('Failed to get Shopify cart:', err);
        return null;
    }
}
