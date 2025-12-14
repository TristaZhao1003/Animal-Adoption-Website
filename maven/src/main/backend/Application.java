package com.paws.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories // 启用 MongoDB 仓库扫描
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}