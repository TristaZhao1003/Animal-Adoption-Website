package com.paws.backend.controller;

import com.paws.backend.model.Animal;
import com.paws.backend.model.User;
import com.paws.backend.repository.AnimalRepository;
import com.paws.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/animals")
public class AnimalController {

    @Autowired
    private AnimalRepository animalRepository;
    @Autowired
    private UserRepository userRepository;


    // 获取所有可用宠物
    @GetMapping("/available")
    public List<Animal> getAvailableAnimals() {
        // 返回所有状态为 AVAILABLE 的动物
        // 如果数据库为空，前端代码通常有 fallback 数据，或者你可以写一个初始化数据的接口
        return animalRepository.findByStatus("AVAILABLE");
    }

    // 获取所有宠物（包括已领养的）
    @GetMapping("/all")
    public List<Animal> getAllAnimals() {
        return animalRepository.findAll();
    }

    // 获取单个宠物详情
    @GetMapping("/{id}")
    public Animal getAnimalById(@PathVariable String id) {
        return animalRepository.findById(id).orElse(null);
    }

    // 搜索宠物 (简化版)
    @GetMapping("/search")
    public List<Animal> searchAnimals(@RequestParam String q) {
        // 这里简单返回所有，实际可以加 Mongo Template 查询
        return animalRepository.findByStatus("AVAILABLE");
    }

    // 添加宠物 (供管理员或初始化使用)
    @PostMapping("/add")
    public Animal addAnimal(@RequestBody Animal animal) {
        if (animal.getStatus() == null) {
            animal.setStatus("AVAILABLE");
        }
        return animalRepository.save(animal);
    }


    // 更新宠物信息 (需要管理员权限)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnimal(
            @PathVariable String id,
            @RequestBody Animal updatedAnimal,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Check authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        // Extract and validate token
        String token = authHeader.substring(7);
        if (!token.startsWith("fake-jwt-token-")) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        // Extract user ID from token
        String userId = token.replace("fake-jwt-token-", "");
        User user = userRepository.findById(userId).orElse(null);

        // Check if user exists and is ADMIN
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        // Find and update animal
        Animal existingAnimal = animalRepository.findById(id).orElse(null);
        if (existingAnimal == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Animal not found"));
        }

        // Update all fields
        existingAnimal.setName(updatedAnimal.getName());
        existingAnimal.setType(updatedAnimal.getType());
        existingAnimal.setBreed(updatedAnimal.getBreed());
        existingAnimal.setAge(updatedAnimal.getAge());
        existingAnimal.setGender(updatedAnimal.getGender());
        existingAnimal.setLocation(updatedAnimal.getLocation());
        existingAnimal.setSize(updatedAnimal.getSize());
        existingAnimal.setNeutered(updatedAnimal.isNeutered());
        existingAnimal.setStatus(updatedAnimal.getStatus());
        existingAnimal.setImage(updatedAnimal.getImage());
        existingAnimal.setStory(updatedAnimal.getStory());
        existingAnimal.setPersonality(updatedAnimal.getPersonality());

        Animal savedAnimal = animalRepository.save(existingAnimal);
        return ResponseEntity.ok(Map.of("message", "Animal updated successfully", "animal", savedAnimal));
    }
}