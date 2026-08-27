package com.arstore.repository;

import com.arstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCollectionId(String collectionId);

    List<Product> findByFeaturedTrue();

    List<Product> findByCollectionIdAndFeaturedTrue(String collectionId);

    @Query("select p from Product p where lower(p.name) like lower(concat('%', :q, '%')) " +
           "or lower(p.collection.name) like lower(concat('%', :q, '%'))")
    List<Product> search(@Param("q") String q);
}
