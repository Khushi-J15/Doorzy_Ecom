package com.ecommerce.app.service;

import com.ecommerce.app.model.CartItem;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserService userService;

    public void addToCart(User user, String productId, int quantity) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }

        Product product = productOpt.get();
        if (!product.isActive()) {
            throw new RuntimeException("Product is not available");
        }

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        List<CartItem> cart = user.getCart();
        Optional<CartItem> existingItem = cart.stream()
            .filter(item -> item.getProductId().equals(productId))
            .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock");
            }
            item.setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem(
                product.getId(),
                product.getName(),
                product.getPrice(),
                quantity,
                product.getImageUrl()
            );
            cart.add(newItem);
        }

        userService.save(user);
    }

    public void removeFromCart(User user, String productId) {
        List<CartItem> cart = user.getCart();
        cart.removeIf(item -> item.getProductId().equals(productId));
        userService.save(user);
    }

    public void updateCartItemQuantity(User user, String productId, int quantity) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }

        Product product = productOpt.get();
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        List<CartItem> cart = user.getCart();
        Optional<CartItem> existingItem = cart.stream()
            .filter(item -> item.getProductId().equals(productId))
            .findFirst();

        if (existingItem.isPresent()) {
            if (quantity <= 0) {
                removeFromCart(user, productId);
            } else {
                existingItem.get().setQuantity(quantity);
                userService.save(user);
            }
        }
    }

    public void clearCart(User user) {
        user.getCart().clear();
        userService.save(user);
    }

    public BigDecimal getCartTotal(User user) {
        return user.getCart().stream()
            .map(CartItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int getCartItemCount(User user) {
        return user.getCart().stream()
            .mapToInt(CartItem::getQuantity)
            .sum();
    }
}