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
            // 1. initialize animal data
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

                // 8. Milo (British Shorthair Cat)
                Animal a8 = new Animal();
                a8.setName("Milo");
                a8.setType("cat");
                a8.setBreed("British Shorthair");
                a8.setAge("4 years");
                a8.setGender("Male");
                a8.setSize("medium");
                a8.setLocation("Shanghai");
                a8.setNeutered(true);
                a8.setStatus("AVAILABLE");
                a8.setImage("https://images.unsplash.com/photo-1514888286974-6d03bdeacba8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a8.setStory("Milo was surrendered by a family who could no longer care for him. He's a gentle, laid-back cat who enjoys lounging in sunny spots.");
                a8.setPersonality(List.of("gentle", "calm", "independent", "affectionate"));

                // 9. Daisy (Bunny)
                Animal a9 = new Animal();
                a9.setName("Daisy");
                a9.setType("rabbit");
                a9.setBreed("Holland Lop");
                a9.setAge("1 year");
                a9.setGender("Female");
                a9.setSize("small");
                a9.setLocation("Hangzhou");
                a9.setNeutered(true);
                a9.setStatus("AVAILABLE");
                a9.setImage("https://images.unsplash.com/photo-1556838803-cc94986cb631?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a9.setStory("Daisy was found abandoned in a park. She's a sweet, curious bunny who loves fresh vegetables and gentle pets.");
                a9.setPersonality(List.of("gentle", "curious", "playful", "social"));

                // 10. Max (German Shepherd)
                Animal a10 = new Animal();
                a10.setName("Max");
                a10.setType("dog");
                a10.setBreed("German Shepherd");
                a10.setAge("4 years");
                a10.setGender("Male");
                a10.setSize("large");
                a10.setLocation("Beijing");
                a10.setNeutered(true);
                a10.setStatus("RESERVED");
                a10.setImage("https://images.unsplash.com/photo-1615751072497-5f5169febe17?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a10.setStory("Max served as a police dog before retiring. He's well-trained, loyal, and looking for a home that can provide structure and activity.");
                a10.setPersonality(List.of("loyal", "intelligent", "protective", "trainable"));

                // 11. Bella (Bengal Cat)
                Animal a11 = new Animal();
                a11.setName("Bella");
                a11.setType("cat");
                a11.setBreed("Bengal");
                a11.setAge("2 years");
                a11.setGender("Female");
                a11.setSize("medium");
                a11.setLocation("Shenzhen");
                a11.setNeutered(true);
                a11.setStatus("AVAILABLE");
                a11.setImage("https://images.unsplash.com/photo-1573866926487-a1865558a9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a11.setStory("Bella was rescued from a backyard breeder. She has beautiful markings and loves climbing and exploring.");
                a11.setPersonality(List.of("active", "playful", "vocal", "curious"));

                // 12. Rocky (Parrot)
                Animal a12 = new Animal();
                a12.setName("Rocky");
                a12.setType("bird");
                a12.setBreed("African Grey");
                a12.setAge("10 years");
                a12.setGender("Male");
                a12.setSize("small");
                a12.setLocation("Guangzhou");
                a12.setNeutered(false);
                a12.setStatus("AVAILABLE");
                a12.setImage("https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a12.setStory("Rocky's previous owner passed away. He's an intelligent African Grey who can mimic words and loves attention.");
                a12.setPersonality(List.of("intelligent", "talkative", "social", "playful"));

                // 13. Coco (French Bulldog)
                Animal a13 = new Animal();
                a13.setName("Coco");
                a13.setType("dog");
                a13.setBreed("French Bulldog");
                a13.setAge("3 years");
                a13.setGender("Female");
                a13.setSize("small");
                a13.setLocation("Chengdu");
                a13.setNeutered(true);
                a13.setStatus("ADOPTED");
                a13.setImage("https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a13.setStory("Coco was surrendered due to her owner's health issues. She's a sweet, cuddly Frenchie who loves to nap and be close to people.");
                a13.setPersonality(List.of("affectionate", "playful", "calm", "friendly"));

                // 14. Simba (Maine Coon Cat)
                Animal a14 = new Animal();
                a14.setName("Simba");
                a14.setType("cat");
                a14.setBreed("Maine Coon");
                a14.setAge("5 years");
                a14.setGender("Male");
                a14.setSize("large");
                a14.setLocation("Beijing");
                a14.setNeutered(true);
                a14.setStatus("AVAILABLE");
                a14.setImage("https://images.unsplash.com/photo-1593482892290-5d188b9e56dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a14.setStory("Simba was found as a stray with matted fur. After grooming and care, he's revealed as a majestic Maine Coon.");
                a14.setPersonality(List.of("majestic", "gentle", "friendly", "playful"));

                // 15. Pepper (Guinea Pig)
                Animal a15 = new Animal();
                a15.setName("Pepper");
                a15.setType("small animal");
                a15.setBreed("Guinea Pig");
                a15.setAge("8 months");
                a15.setGender("Female");
                a15.setSize("small");
                a15.setLocation("Shanghai");
                a15.setNeutered(false);
                a15.setStatus("AVAILABLE");
                a15.setImage("https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a15.setStory("Pepper was part of an accidental litter. She's a sweet guinea pig who loves fresh veggies and gentle handling.");
                a15.setPersonality(List.of("gentle", "vocal", "social", "curious"));

                // 16. Duke (Beagle)
                Animal a16 = new Animal();
                a16.setName("Duke");
                a16.setType("dog");
                a16.setBreed("Beagle");
                a16.setAge("1 year");
                a16.setGender("Male");
                a16.setSize("medium");
                a16.setLocation("Hangzhou");
                a16.setNeutered(false);
                a16.setStatus("AVAILABLE");
                a16.setImage("https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a16.setStory("Duke was found as a stray, following his nose everywhere! He's a typical Beagle - curious, friendly, and food-motivated.");
                a16.setPersonality(List.of("curious", "friendly", "vocal", "energetic"));

                // 17. Misty (Ragdoll Cat)
                Animal a17 = new Animal();
                a17.setName("Misty");
                a17.setType("cat");
                a17.setBreed("Ragdoll");
                a17.setAge("3 years");
                a17.setGender("Female");
                a17.setSize("large");
                a17.setLocation("Shenzhen");
                a17.setNeutered(true);
                a17.setStatus("PENDING");
                a17.setImage("https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80");
                a17.setStory("Misty was surrendered when her family had a new baby with allergies. She's a gentle Ragdoll who loves to be held.");
                a17.setPersonality(List.of("gentle", "affectionate", "calm", "relaxed"));



                animalRepository.saveAll(List.of(a1, a2, a3, a4, a5, a6, a7,a8, a9, a10, a11, a12, a13, a14, a15, a16, a17));
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