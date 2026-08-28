package com.brsecopilot.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình ChatClient dùng chung cho toàn bộ các Service AI (qua AiChatExecutor).
 * ChatClient.Builder được spring-ai-starter-model-google-genai tự động cấu hình
 * (đọc spring.ai.google.genai.* từ application.yml - Gemini Developer API).
 */
@Configuration
public class AiAgentConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder chatClientBuilder) {
        return chatClientBuilder.build();
    }
}
