package com.brsecopilot.dto.offshore;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * specText/codeText bắt buộc khi mode = SPEC_DIFF.
 * rawQuestion bắt buộc khi mode = SHADOW_CLIENT.
 * codeText bắt buộc khi mode = UNIT_TEST_GEN (testFramework tuỳ chọn).
 * specText bắt buộc khi mode = TEST_CASE_GEN (codeText tuỳ chọn).
 * Việc này được kiểm tra chéo (cross-field) thủ công trong Service,
 * vì Bean Validation @NotBlank không thể điều kiện theo field khác.
 */
public record OffshoreReviewRequest(
        @NotNull(message = "modeは必須です") ReviewMode mode,
        @Size(max = 6000, message = "仕様書テキストは6000文字以内で入力してください") String specText,
        @Size(max = 6000, message = "コードテキストは6000文字以内で入力してください") String codeText,
        @Size(max = 2000, message = "質問内容は2000文字以内で入力してください") String rawQuestion,
        @Size(max = 50, message = "テストフレームワークは50文字以内で入力してください") String testFramework
) {
}
