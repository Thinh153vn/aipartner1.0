package com.brsecopilot.dto.offshore;

/** オフショア支援の結果。分析本文とリスク警告。 */
public record OffshoreReviewResponse(
        String analysisText,
        String riskWarningText
) {
}
