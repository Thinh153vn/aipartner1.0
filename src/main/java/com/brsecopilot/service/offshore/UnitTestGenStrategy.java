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
 * アップロード／貼付ソースからユニットテストを生成する（JavaはJUnit5＋Mockito、JS/TSはJest）。
 */
@Component
public class UnitTestGenStrategy implements OffshoreReviewStrategy {

    private static final Logger log = LoggerFactory.getLogger(UnitTestGenStrategy.class);
    private static final String OPERATION_NAME = "Unit Test生成";
    private static final String DEFAULT_FRAMEWORK_LABEL = "コードの言語から自動判定（Java→JUnit5+Mockito / JS,TS→Jest）";

    private final AiChatExecutor aiChatExecutor;

    public UnitTestGenStrategy(AiChatExecutor aiChatExecutor) {
        this.aiChatExecutor = aiChatExecutor;
    }

    @Override
    public boolean supports(ReviewMode mode) {
        return mode == ReviewMode.UNIT_TEST_GEN;
    }

    @Override
    public OffshoreReviewResponse execute(OffshoreReviewRequest request) {
        if (isBlank(request.codeText())) {
            throw new InvalidRequestException("ユニットテスト生成ではソースコードが必須です。");
        }

        String frameworkLabel = resolveFrameworkLabel(request.testFramework());
        log.info("Unit Test生成リクエストを受信しました codeLength={} framework={}",
                request.codeText().length(), frameworkLabel);

        String userPrompt = """
                【テスト対象ソースコード】
                %s

                【指定テストフレームワーク】
                %s

                上記のソースコードに対するUnit Testを生成してください。
                """.formatted(request.codeText(), frameworkLabel);

        return aiChatExecutor.execute(
                AiPrompts.OFFSHORE_UNIT_TEST_GEN_SYSTEM, userPrompt, OffshoreReviewResponse.class, OPERATION_NAME);
    }

    private static String resolveFrameworkLabel(String testFramework) {
        if (isBlank(testFramework)) {
            return DEFAULT_FRAMEWORK_LABEL;
        }
        return switch (testFramework.trim().toUpperCase()) {
            case "JUNIT5" -> "JUnit5 + Mockito（Java）";
            case "JEST" -> "Jest（JavaScript / TypeScript）";
            default -> testFramework;
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
