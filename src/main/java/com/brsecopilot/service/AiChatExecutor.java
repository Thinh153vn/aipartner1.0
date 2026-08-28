package com.brsecopilot.service;

import com.brsecopilot.exception.AiAgentException;
import com.brsecopilot.exception.InvalidRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

/**
 * Đầu mối DUY NHẤT gọi Gemini qua Spring AI ChatClient cho mọi nghiệp vụ AI.
 *
 * Trước đây logic này bị lặp lại (copy-paste) như 1 private method bên trong
 * 1 "God Class" (SpringAiAgentServiceImpl) ôm cả 4 nghiệp vụ khác nhau. Tách
 * riêng ra 1 collaborator dùng chung (Single Responsibility: chỉ lo việc gọi
 * AI + chuẩn hoá lỗi/log) để mỗi nghiệp vụ AI có thể có Service riêng, độc lập,
 * dễ test/mở rộng mà không phải chép lại phần try-catch + logging này.
 */
@Component
public class AiChatExecutor {

    private static final Logger log = LoggerFactory.getLogger(AiChatExecutor.class);

    private final ChatClient chatClient;

    public AiChatExecutor(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Gọi ChatClient với System/User Prompt, ép model trả JSON đúng schema của
     * {@code responseType}. Mọi lỗi giao tiếp/parse JSON đều được bọc thành
     * AiAgentException để GlobalExceptionHandler trả về 502 thân thiện thay vì
     * crash 500.
     *
     * @param operationName tên nghiệp vụ dùng để log/thông báo lỗi (ví dụ "スケジュール分析")
     */
    public <T> T execute(String systemPrompt, String userPrompt, Class<T> responseType, String operationName) {
        log.info("AIエージェント呼び出しを開始します operation={}", operationName);
        try {
            T result = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .entity(responseType);

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
}
