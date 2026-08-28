package com.brsecopilot.dto.file;

/**
 * Kết quả trích xuất text từ 1 file upload (PDF hoặc file text/code thuần).
 * truncated = true nếu nội dung gốc dài hơn giới hạn cho phép và đã bị cắt bớt
 * (giới hạn theo @Size của OffshoreReviewRequest.specText/codeText).
 */
public record ExtractedTextResponse(
        String text,
        boolean truncated,
        String originalFilename
) {
}
