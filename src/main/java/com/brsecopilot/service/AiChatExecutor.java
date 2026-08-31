package com.brsecopilot.service;

import com.brsecopilot.config.UserApiKeyHolder;
import com.brsecopilot.exception.AiAgentException;
import com.brsecopilot.exception.InvalidRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * 全AI業務の Gemini 呼び出し窓口。
 * ブラウザから BYOK キーがあればそのキーで REST 呼び出し、無ければ環境変数の ChatClient を使う。
 */
@Component
public class AiChatExecutor {

    private static final Logger log = LoggerFactory.getLogger(AiChatExecutor.class);
    private static final String GEMINI_MODEL = "gemini-3.6-flash";
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent";

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    public AiChatExecutor(ChatClient chatClient, ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    /**
     * System／User プロンプトで呼び出し、{@code responseType} の JSON スキーマに合わせて返す。
     */
    public <T> T execute(String systemPrompt, String userPrompt, Class<T> responseType, String operationName) {
        log.info("AIエージェント呼び出しを開始します operation={}", operationName);
        try {
            String userApiKey = UserApiKeyHolder.get();
            T result = (userApiKey != null && !userApiKey.isBlank())
                    ? executeWithUserKey(systemPrompt, userPrompt, responseType, userApiKey)
                    : executeWithDefaultClient(systemPrompt, userPrompt, responseType);

            if (result == null) {
                throw new AiAgentException("AIエージェントから空の応答が返されました（" + operationName + "）。");
            }

            log.info("AIエージェント呼び出しが成功しました operation={}", operationName);
            return result;
        } catch (AiAgentException | InvalidRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("{} の呼び出し中にエラーが発生しました", operationName, ex);
            throw new AiAgentException(
                    "AIエージェントの応答形式が不正、または通信に失敗しました（" + operationName + "）。", ex);
        }
    }

    private <T> T executeWithDefaultClient(String systemPrompt, String userPrompt, Class<T> responseType) {
        return chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .entity(responseType);
    }

    private <T> T executeWithUserKey(
            String systemPrompt, String userPrompt, Class<T> responseType, String apiKey) {
        BeanOutputConverter<T> converter = new BeanOutputConverter<>(responseType);
        String userContent = userPrompt + "\n\n" + converter.getFormat();

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", userContent))
                )),
                "generationConfig", Map.of("temperature", 0.4)
        );

        String rawBody;
        try {
            rawBody = restClient.post()
                    .uri(GEMINI_URL)
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException ex) {
            throw new AiAgentException("APIキーが無効、またはAIエージェントとの通信に失敗しました。キーをご確認ください。", ex);
        }

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                throw new AiAgentException("AIエージェントから空の応答が返されました。");
            }
            return converter.convert(textNode.asText());
        } catch (AiAgentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AiAgentException("AIエージェントの応答形式が不正です。", ex);
        }
    }
}
