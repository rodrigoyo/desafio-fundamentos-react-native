import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartLoaded = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (cartLoaded) {
        setProducts(JSON.parse(cartLoaded));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART

      const cart: Product[] = products;
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex < 0) {
        const newProduct: Product = product;
        newProduct.quantity = 1;
        cart.push(newProduct);
      } else {
        cart[productIndex].quantity += 1;
      }

      setProducts([...cart]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(item => item.id === id);
      const cartUpdated: Product[] = products;
      cartUpdated[index].quantity += 1;

      setProducts([...cartUpdated]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(item => item.id === id);
      const cartUpdated: Product[] = products;
      cartUpdated[index].quantity -= 1;

      if (cartUpdated[index].quantity <= 0) {
        cartUpdated[index].quantity = 0;
        cartUpdated.splice(index, 1);
      }

      setProducts([...cartUpdated]);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
