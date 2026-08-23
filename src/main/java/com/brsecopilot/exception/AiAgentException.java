package com.brsecopilot.exception;

/**
 * Ném ra khi việc gọi AI (Spring AI / OpenAI) thất bại: timeout, sai API key,
 * hết quota, hoặc phản hồi trả về không đúng định dạng JSON kỳ vọng.
 * Được GlobalExceptionHandler bắt và trả HTTP 502 kèm message thân thiện.
 */
public class AiAgentException extends RuntimeException {

    public AiAgentException(String message) {
        super(message);
    }

    public AiAgentException(String message, Throwable cause) {
        super(message, cause);
    }
}
