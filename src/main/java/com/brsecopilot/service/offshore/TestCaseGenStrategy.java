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

/**
 * Nghiệp vụ "テストケース生成": sinh bộ test case theo RBT từ tài liệu yêu cầu
 * (và tuỳ chọn source code), dùng methodology trong thư mục test/prompt_templates.
 */
@Component
public class TestCaseGenStrategy implements OffshoreReviewStrategy {

    private static final Logger log = LoggerFactory.getLogger(TestCaseGenStrategy.class);
    private static final String OPERATION_NAME = "テストケース生成";

    private final AiChatExecutor aiChatExecutor;

    public TestCaseGenStrategy(AiChatExecutor aiChatExecutor) {
        this.aiChatExecutor = aiChatExecutor;
    }

    @Override
    public boolean supports(ReviewMode mode) {
        return mode == ReviewMode.TEST_CASE_GEN;
    }

    @Override
    public OffshoreReviewResponse execute(OffshoreReviewRequest request) {
        if (isBlank(request.specText())) {
            throw new InvalidRequestException("テストケース生成では要件テキストが必須です。");
        }

        String codeSection = isBlank(request.codeText())
                ? "（ソースコードは未添付。要件のみからテストケースを作成してください。）"
                : request.codeText();

        log.info("テストケース生成リクエストを受信しました specLength={} codeAttached={}",
                request.specText().length(), !isBlank(request.codeText()));

        String userPrompt = """
                【要件・受け入れ条件】
                %s

                【参考ソースコード（任意）】
                %s

                上記に基づき、Risk-Based Testing のテストケース一式を作成してください。
                """.formatted(request.specText(), codeSection);

        return aiChatExecutor.execute(
                AiPrompts.OFFSHORE_TEST_CASE_GEN_SYSTEM, userPrompt, OffshoreReviewResponse.class, OPERATION_NAME);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
