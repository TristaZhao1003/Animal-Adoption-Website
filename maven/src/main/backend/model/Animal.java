package com.paws.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "animals")
public class Animal {
    @Id
    private String id;
    private String name;
    private String type; // dog, cat
    private String breed;
    private String age;
    private String gender;
    private String location;
    private String size;
    private boolean neutered;
    private String status; // AVAILABLE, ADOPTED, RESERVED
    private String image; // URL
    private String story;
    private List<String> personality; // [Friendly, Playful]
}