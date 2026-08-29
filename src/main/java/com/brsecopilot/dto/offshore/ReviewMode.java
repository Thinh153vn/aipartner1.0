package com.brsecopilot.dto.offshore;

/**
 * Phân biệt các nghiệp vụ dùng chung endpoint /api/v1/copilot/review-offshore:
 * - SPEC_DIFF: so sánh Spec vs Code, phát hiện điểm không khớp.
 * - SHADOW_CLIENT: dịch câu hỏi thô sang tiếng Nhật business + cảnh báo rủi ro.
 * - UNIT_TEST_GEN: sinh Unit Test tự động từ source code đã upload/dán.
 * - TEST_CASE_GEN: sinh bộ test case (RBT) từ tài liệu yêu cầu (要件).
 */
public enum ReviewMode {
    SPEC_DIFF,
    SHADOW_CLIENT,
    UNIT_TEST_GEN,
    TEST_CASE_GEN
}
