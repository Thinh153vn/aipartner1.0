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

/** Nghiệp vụ "Spec vs Code": so sánh tài liệu thiết kế với source code, phát hiện điểm không khớp + rủi ro bảo mật. */
@Component
public class SpecDiffReviewStrategy implements OffshoreReviewStrategy {

    private static final Logger log = LoggerFactory.getLogger(SpecDiffReviewStrategy.class);
    private static final String OPERATION_NAME = "Spec vs Code 比較";

    private final AiChatExecutor aiChatExecutor;

    public SpecDiffReviewStrategy(AiChatExecutor aiChatExecutor) {
        this.aiChatExecutor = aiChatExecutor;
    }

    @Override
    public boolean supports(ReviewMode mode) {
        return mode == ReviewMode.SPEC_DIFF;
    }

    @Override
    public OffshoreReviewResponse execute(OffshoreReviewRequest request) {
        if (isBlank(request.specText()) || isBlank(request.codeText())) {
            throw new InvalidRequestException("SPEC_DIFFモードでは specText と codeText の両方が必須です。");
        }

        log.info("Spec vs Code比較リクエストを受信しました specLength={} codeLength={}",
                request.specText().length(), request.codeText().length());

        String userPrompt = """
                【仕様書】
                %s

                【ソースコード】
                %s

                仕様書とソースコードを比較し、不整合を分析してください。
                """.formatted(request.specText(), request.codeText());

        return aiChatExecutor.execute(
                AiPrompts.OFFSHORE_SPEC_DIFF_SYSTEM, userPrompt, OffshoreReviewResponse.class, OPERATION_NAME);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
