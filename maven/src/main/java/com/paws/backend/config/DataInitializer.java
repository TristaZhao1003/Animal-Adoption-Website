package com.paws.backend.config;

import com.paws.backend.model.Animal;
import com.paws.backend.model.User;
import com.paws.backend.repository.AnimalRepository;
import com.paws.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(AnimalRepository animalRepository,
                                   UserRepository userRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. 初始化动物数据
            if (animalRepository.count() == 0) {
                // 1. Buddy
                Animal a1 = new Animal();
                a1.setName("Buddy");
                a1.setType("dog");
                a1.setBreed("Mixed Breed");
                a1.setAge("2 years");
                a1.setGender("Male");
                a1.setSize("medium");
                a1.setLocation("Beijing");
                a1.setNeutered(true);
                a1.setStatus("AVAILABLE");
                a1.setImage("https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a1.setStory("Buddy was found on a rainy day, shivering in a cardboard box. After our care, he has recovered and become a lively, friendly companion.");
                a1.setPersonality(List.of("friendly", "active", "playful", "loyal"));

                // 2. Shadow
                Animal a2 = new Animal();
                a2.setName("Shadow");
                a2.setType("cat");
                a2.setBreed("Siamese");
                a2.setAge("6 months");
                a2.setGender("Male");
                a2.setSize("small");
                a2.setLocation("Shenzhen");
                a2.setNeutered(false);
                a2.setStatus("AVAILABLE");
                a2.setImage("https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a2.setStory("Shadow was found in a parking lot when he was very small. He's extremely curious and interested in everything around him.");
                a2.setPersonality(List.of("curious", "active", "playful", "smart"));

                // 3. Fluffy
                Animal a3 = new Animal();
                a3.setName("Fluffy");
                a3.setType("cat");
                a3.setBreed("Persian");
                a3.setAge("5 years");
                a3.setGender("Female");
                a3.setSize("small");
                a3.setLocation("Hangzhou");
                a3.setNeutered(true);
                a3.setStatus("AVAILABLE");
                a3.setImage("https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a3.setStory("Fluffy's previous owner had to give her up due to cat allergies. She is a very elegant Persian cat with a gentle, calm personality.");
                a3.setPersonality(List.of("elegant", "calm", "gentle"));

                // 4. Charlie
                Animal a4 = new Animal();
                a4.setName("Charlie");
                a4.setType("dog");
                a4.setBreed("Golden Retriever");
                a4.setAge("3 years");
                a4.setGender("Male");
                a4.setSize("large");
                a4.setLocation("Chengdu");
                a4.setNeutered(true);
                a4.setStatus("AVAILABLE");
                a4.setImage("https://images.unsplash.com/photo-1568572933382-74d440642117?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a4.setStory("Charlie was surrendered when his family moved overseas. He's incredibly friendly and great with children.");
                a4.setPersonality(List.of("friendly", "patient", "good with kids", "intelligent"));

                // 5. Luna
                Animal a5 = new Animal();
                a5.setName("Luna");
                a5.setType("dog");
                a5.setBreed("Husky");
                a5.setAge("2 years");
                a5.setGender("Female");
                a5.setSize("large");
                a5.setLocation("Beijing");
                a5.setNeutered(true);
                a5.setStatus("AVAILABLE");
                a5.setImage("https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a5.setStory("Luna was found as a stray. She's full of energy and loves to play. She would be perfect for an active family.");
                a5.setPersonality(List.of("energetic", "playful", "vocal", "needs exercise"));

                // 6. Oliver
                Animal a6 = new Animal();
                a6.setName("Oliver");
                a6.setType("cat");
                a6.setBreed("Maine Coon");
                a6.setAge("4 years");
                a6.setGender("Male");
                a6.setSize("large");
                a6.setLocation("Guangzhou");
                a6.setNeutered(true);
                a6.setStatus("AVAILABLE");
                a6.setImage("https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a6.setStory("Oliver is a gentle giant. He's a large Maine Coon with a heart to match. He's very friendly but also enjoys his quiet time.");
                a6.setPersonality(List.of("gentle", "friendly", "quiet", "large"));

                // 7. Vivi
                Animal a7 = new Animal();
                a7.setName("Vivi");
                a7.setType("dog");
                a7.setBreed("teddy");
                a7.setAge("10 years");
                a7.setGender("Male");
                a7.setSize("tiny");
                a7.setLocation("HongKong");
                a7.setNeutered(true);
                a7.setStatus("AVAILABLE");
                a7.setImage("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Full_attention_%288067543690%29.jpg/500px-Full_attention_%288067543690%29.jpg");
                a7.setStory("good boy");

                a7.setPersonality(List.of("aggressive", "naughty", "tiny but bossy", "XiaoBiGa"));

                animalRepository.saveAll(List.of(a1, a2, a3, a4, a5, a6,a7));
                System.out.println("Initialized animal data");
            }

            // 2. user data initialize
            if (userRepository.count() == 0) {
                // user
                User user = new User();
                user.setFullName("Test User");
                user.setEmail("user@example.com");
                user.setPassword(passwordEncoder.encode("password123"));
                user.setPhone("12345678");
                user.setRole("USER");

                // admin/vonlunteer
                User admin = new User();
                admin.setFullName("Admin User");
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setPhone("87654321");
                admin.setRole("ADMIN");
                admin.setVolunteer(true);
                admin.setVolunteerRole("Manager");

                userRepository.saveAll(List.of(user, admin));
                System.out.println("Initialized user data");
            }
        };
    }
}