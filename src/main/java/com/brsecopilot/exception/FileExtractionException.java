package com.brsecopilot.exception;

/**
 * アップロードファイルのテキスト抽出失敗。GlobalExceptionHandler が HTTP 400 で返す。
 */
public class FileExtractionException extends RuntimeException {

    public FileExtractionException(String message) {
        super(message);
    }

    public FileExtractionException(String message, Throwable cause) {
        super(message, cause);
    }
}
