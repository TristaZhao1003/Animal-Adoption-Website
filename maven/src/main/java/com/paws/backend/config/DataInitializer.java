package com.paws.backend.config;

import com.paws.backend.model.Animal;
import com.paws.backend.repository.AnimalRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(AnimalRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                Animal a1 = new Animal();
                a1.setName("Bella");
                a1.setType("dog");
                a1.setBreed("Golden Retriever");m
                a1.setAge("2 years");
                a1.setGender("Female");
                a1.setLocation("Hong Kong Island");
                a1.setNeutered(true);
                a1.setStatus("AVAILABLE");
                a1.setImage("https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a1.setPersonality(List.of("Friendly", "Playful"));

                Animal a2 = new Animal();
                a2.setName("Luna");
                a2.setType("cat");
                a2.setBreed("Domestic Shorthair");
                a2.setAge("1 year");
                a2.setGender("Female");
                a2.setLocation("Kowloon");
                a2.setNeutered(true);
                a2.setStatus("AVAILABLE");
                a2.setImage("https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a2.setPersonality(List.of("Calm", "Affectionate"));

                repository.saveAll(List.of(a1, a2));
                System.out.println("Initialized dummy animal data");
            }
        };
    }
}