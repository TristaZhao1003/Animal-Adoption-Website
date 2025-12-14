package com.paws.backend.repository;

import com.paws.backend.model.Animal;
import com.paws.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}

public interface AnimalRepository extends MongoRepository<Animal, String> {
    List<Animal> findByStatus(String status);
}