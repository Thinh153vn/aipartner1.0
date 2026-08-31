package com.brsecopilot.dto.offshore;

/**
 * /review-offshore の業務区分。
 * SPEC_DIFF: 仕様とコードの差分。SHADOW_CLIENT: 顧客質問の点検。
 * UNIT_TEST_GEN: ユニットテスト生成。TEST_CASE_GEN: 要件からのテストケース生成。
 */
public enum ReviewMode {
    SPEC_DIFF,
    SHADOW_CLIENT,
    UNIT_TEST_GEN,
    TEST_CASE_GEN
}
