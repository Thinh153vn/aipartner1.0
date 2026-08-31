package com.brsecopilot.dto.offshore;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 必須項目は mode により異なる（SPEC_DIFF は仕様とコード、SHADOW_CLIENT は質問、など）。
 * 条件付き必須は Bean Validation では表せないため、Service 側で交差チェックする。
 */
public record OffshoreReviewRequest(
        @NotNull(message = "modeは必須です") ReviewMode mode,
        @Size(max = 6000, message = "仕様書テキストは6000文字以内で入力してください") String specText,
        @Size(max = 6000, message = "コードテキストは6000文字以内で入力してください") String codeText,
        @Size(max = 2000, message = "質問内容は2000文字以内で入力してください") String rawQuestion,
        @Size(max = 50, message = "テストフレームワークは50文字以内で入力してください") String testFramework
) {
}
