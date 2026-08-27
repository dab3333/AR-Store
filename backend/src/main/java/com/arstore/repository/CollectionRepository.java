package com.arstore.repository;

import com.arstore.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollectionRepository extends JpaRepository<Collection, String> {
}
