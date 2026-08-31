package com.brsecopilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * GROWTH PARTNER バックエンドの起動点。
 * REST API（/api/v1/copilot/**）と静的フロントを同一ポート（既定8080）で提供する。CORS設定は不要。
 */
@SpringBootApplication
public class BrseCopilotApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrseCopilotApplication.class, args);
    }
}
