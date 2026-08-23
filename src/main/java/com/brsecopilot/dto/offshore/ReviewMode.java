package com.brsecopilot.dto.offshore;

/**
 * Phân biệt 2 nghiệp vụ dùng chung endpoint /api/v1/copilot/review-offshore:
 * - SPEC_DIFF: so sánh Spec vs Code, phát hiện điểm không khớp.
 * - SHADOW_CLIENT: dịch câu hỏi thô sang tiếng Nhật business + cảnh báo rủi ro.
 */
public enum ReviewMode {
    SPEC_DIFF,
    SHADOW_CLIENT
}
