package com.brsecopilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Điểm khởi động ứng dụng AI PARTNER Backend.
 * Spring Boot vừa phục vụ REST API (/api/v1/copilot/**) vừa serve frontend tĩnh
 * (index.html, assets/css, assets/js) từ src/main/resources/static, nên chỉ cần
 * chạy một cổng duy nhất (mặc định 8080), không cần cấu hình CORS.
 */
@SpringBootApplication
public class BrseCopilotApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrseCopilotApplication.class, args);
    }
}
