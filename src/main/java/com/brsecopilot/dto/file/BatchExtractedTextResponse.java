package com.brsecopilot.dto.file;

import java.util.List;

/**
 * 複数ファイル抽出の結合結果。本文中にファイル名を残し、AIが仕様比較で出所を判別できるようにする。
 */
public record BatchExtractedTextResponse(
        String text,
        boolean truncated,
        int includedFileCount,
        List<String> includedFilenames,
        List<String> skippedFilenames
) {
}
