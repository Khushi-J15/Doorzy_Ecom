package com.ecommerce.app.repository;

import com.ecommerce.app.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByActiveTrue();
    List<Product> findByCategory(String category);
    List<Product> findByActiveTrueAndCategory(String category);
    
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'keywords': { $in: [{ $regex: ?0, $options: 'i' }] } } ] }")
    List<Product> findByTextSearch(String searchText);
    
    @Query("{ 'active': true, $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'keywords': { $in: [{ $regex: ?0, $options: 'i' }] } } ] }")
    List<Product> findActiveByTextSearch(String searchText);
}