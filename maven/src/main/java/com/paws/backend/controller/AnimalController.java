package com.paws.backend.controller;

import com.paws.backend.model.Animal;
import com.paws.backend.repository.AnimalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/animals")
public class AnimalController {

    @Autowired
    private AnimalRepository animalRepository;

    // 获取所有可用宠物
    @GetMapping("/available")
    public List<Animal> getAvailableAnimals() {
        // 返回所有状态为 AVAILABLE 的动物
        // 如果数据库为空，前端代码通常有 fallback 数据，或者你可以写一个初始化数据的接口
        return animalRepository.findByStatus("AVAILABLE");
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
}