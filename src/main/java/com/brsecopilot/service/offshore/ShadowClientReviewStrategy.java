package com.brsecopilot.service.offshore;

import com.brsecopilot.config.AiPrompts;
import com.brsecopilot.dto.offshore.OffshoreReviewRequest;
import com.brsecopilot.dto.offshore.OffshoreReviewResponse;
import com.brsecopilot.dto.offshore.ReviewMode;
import com.brsecopilot.exception.InvalidRequestException;
import com.brsecopilot.service.AiChatExecutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** 顧客へ送る前の質問文を、ビジネス日本語とリスク観点で点検する。 */
@Component
public class ShadowClientReviewStrategy implements OffshoreReviewStrategy {

    private static final Logger log = LoggerFactory.getLogger(ShadowClientReviewStrategy.class);
    private static final String OPERATION_NAME = "Shadow Client レビュー";

    private final AiChatExecutor aiChatExecutor;

    public ShadowClientReviewStrategy(AiChatExecutor aiChatExecutor) {
        this.aiChatExecutor = aiChatExecutor;
    }

    @Override
    public boolean supports(ReviewMode mode) {
        return mode == ReviewMode.SHADOW_CLIENT;
    }

    @Override
    public OffshoreReviewResponse execute(OffshoreReviewRequest request) {
        if (isBlank(request.rawQuestion())) {
            throw new InvalidRequestException("顧客質問レビューでは質問内容が必須です。");
        }

        log.info("Shadow Clientレビューリクエストを受信しました questionLength={}", request.rawQuestion().length());

        String userPrompt = """
                以下はオフショアエンジニアが顧客に送ろうとしている質問の下書きです：
                %s

                この質問をレビューしてください。
                """.formatted(request.rawQuestion());

        return aiChatExecutor.execute(
                AiPrompts.OFFSHORE_SHADOW_CLIENT_SYSTEM, userPrompt, OffshoreReviewResponse.class, OPERATION_NAME);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
