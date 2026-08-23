package com.brsecopilot.dto.offshore;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * specText/codeText bắt buộc khi mode = SPEC_DIFF.
 * rawQuestion bắt buộc khi mode = SHADOW_CLIENT.
 * Việc này được kiểm tra chéo (cross-field) thủ công trong Service,
 * vì Bean Validation @NotBlank không thể điều kiện theo field khác.
 */
public record OffshoreReviewRequest(
        @NotNull(message = "modeは必須です") ReviewMode mode,
        @Size(max = 3000, message = "仕様書テキストは3000文字以内で入力してください") String specText,
        @Size(max = 3000, message = "コードテキストは3000文字以内で入力してください") String codeText,
        @Size(max = 2000, message = "質問内容は2000文字以内で入力してください") String rawQuestion
) {
}
