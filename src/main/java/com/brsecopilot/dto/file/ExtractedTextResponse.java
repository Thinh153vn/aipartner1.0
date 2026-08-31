package com.brsecopilot.dto.file;

/**
 * 単一ファイルの抽出結果。上限超過で切り詰めた場合は truncated=true。
 */
public record ExtractedTextResponse(
        String text,
        boolean truncated,
        String originalFilename
) {
}
