package com.brsecopilot.dto.file;

import java.util.List;

/**
 * Kết quả trích xuất + ghép text từ NHIỀU file upload cùng lúc (ví dụ: cả 1 thư mục
 * project chứa nhiều file source code). Mỗi file được đánh dấu bằng tên trong nội dung
 * ghép (text), giúp AI biết đoạn code nào thuộc file nào khi so sánh với Spec.
 */
public record BatchExtractedTextResponse(
        String text,
        boolean truncated,
        int includedFileCount,
        List<String> includedFilenames,
        List<String> skippedFilenames
) {
}
