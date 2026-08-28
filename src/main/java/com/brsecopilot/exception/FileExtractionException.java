package com.brsecopilot.exception;

/**
 * Ném ra khi việc trích xuất text từ file (PDF/text) upload lên thất bại:
 * file rỗng, quá dung lượng, định dạng không hỗ trợ, hoặc PDF bị lỗi/mã hoá.
 * Được GlobalExceptionHandler bắt và trả HTTP 400 kèm message thân thiện.
 */
public class FileExtractionException extends RuntimeException {

    public FileExtractionException(String message) {
        super(message);
    }

    public FileExtractionException(String message, Throwable cause) {
        super(message, cause);
    }
}
