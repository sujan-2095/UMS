package com.example.ums.config;

import com.example.ums.entity.Role;
import com.example.ums.entity.User;
import com.example.ums.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ums.init.admin.email:admin@test.com}")
    private String adminEmail;

    @Value("${ums.init.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${ums.init.admin.name:System Administrator}")
    private String adminName;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String normalizedEmail = adminEmail.trim().toLowerCase();

        if (!userRepository.existsByEmail(normalizedEmail)) {
            User admin = new User();
            admin.setName(adminName);
            admin.setEmail(normalizedEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            logger.info("===================================================================");
            logger.info(" Initial Administrator initialized successfully in MySQL database");
            logger.info(" Email: {}", normalizedEmail);
            logger.info(" Role: {}", Role.ADMIN);
            logger.info("===================================================================");
        } else {
            logger.info("Administrator account ({}) already exists. Skipping initialization.", normalizedEmail);
        }
    }
}
