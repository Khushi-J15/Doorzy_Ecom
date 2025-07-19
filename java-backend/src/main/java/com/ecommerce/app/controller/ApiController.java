package com.ecommerce.app.controller;

import com.ecommerce.app.model.LoginRequest;
import com.ecommerce.app.model.Order;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import com.ecommerce.app.service.CartService;
import com.ecommerce.app.service.JwtService;
import com.ecommerce.app.service.OrderService;
import com.ecommerce.app.service.ProductService;
import com.ecommerce.app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", savedUser.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            Optional<User> userOpt = userService.findByEmail(loginRequest.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            UserDetails userDetails = userService.loadUserByUsername(loginRequest.getEmail());
            String jwtToken = jwtService.generateToken(userDetails);

            // Create response body without token
            Map<String, Object> responseBody = Map.of(
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole().toString(),
                "message", "Login successful"
            );

            // Add token to response header
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwtToken);
            headers.set("Access-Control-Expose-Headers", "Authorization");

            return ResponseEntity.ok()
                .headers(headers)
                .body(responseBody);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "Test endpoint working"));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id) {
        Optional<Product> product = productService.getProductById(id);
        if (product.isPresent()) {
            return ResponseEntity.ok(product.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String q) {
        return ResponseEntity.ok(productService.searchProducts(q));
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @PostMapping("/cart/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request, Authentication auth) {
        try {
            Optional<User> userOpt = userService.findByEmail(auth.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            String productId = (String) request.get("productId");
            int quantity = (Integer) request.get("quantity");
            
            cartService.addToCart(userOpt.get(), productId, quantity);
            return ResponseEntity.ok(Map.of("message", "Product added to cart"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/cart")
    public ResponseEntity<?> getCart(Authentication auth) {
        Optional<User> userOpt = userService.findByEmail(auth.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
            "items", user.getCart(),
            "total", cartService.getCartTotal(user),
            "itemCount", cartService.getCartItemCount(user)
        ));
    }

    @PostMapping("/cart/view")
    public ResponseEntity<?> viewCartFromClient(@RequestBody List<Map<String, Object>> cartItems) {
        System.out.println("Received Cart Items from Frontend or Node:");
        for (Map<String, Object> item : cartItems) {
            System.out.println("Product ID: " + item.get("id"));
            System.out.println("Name: " + item.get("name"));
            System.out.println("Quantity: " + item.get("quantity"));
            System.out.println("Price: " + item.get("price"));
            System.out.println("Delivery Option: " + item.get("deliveryOptionId"));
            System.out.println("-----");
        }
        return ResponseEntity.ok(Map.of("message", "Cart received", "count", cartItems.size()));
    }


    @DeleteMapping("/cart/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable String productId, Authentication auth) {
        try {
            Optional<User> userOpt = userService.findByEmail(auth.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            cartService.removeFromCart(userOpt.get(), productId);
            return ResponseEntity.ok(Map.of("message", "Product removed from cart"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, String> request, Authentication auth) {
        try {
            Optional<User> userOpt = userService.findByEmail(auth.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            String shippingAddress = request.get("shippingAddress");
            String phoneNumber = request.get("phoneNumber");
            
            Order order = orderService.createOrder(userOpt.get(), shippingAddress, phoneNumber);
            return ResponseEntity.ok(Map.of("message", "Order created successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getUserOrders(Authentication auth) {
        Optional<User> userOpt = userService.findByEmail(auth.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(orderService.getUserOrders(userOpt.get().getId()));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id, Authentication auth) {
        Optional<User> userOpt = userService.findByEmail(auth.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        Optional<Order> orderOpt = orderService.getOrderById(id);
        if (orderOpt.isEmpty() || !orderOpt.get().getUserId().equals(userOpt.get().getId())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(orderOpt.get());
    }
}