package com.brsecopilot.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 全AI業務で共有する ChatClient。
 * spring-ai-starter-model-google-genai が application.yml の spring.ai.google.genai.* から構築する。
 */
@Configuration
public class AiAgentConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder chatClientBuilder) {
        return chatClientBuilder.build();
    }
}
