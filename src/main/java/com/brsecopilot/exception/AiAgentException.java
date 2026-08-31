package com.brsecopilot.exception;

/**
 * AI呼び出し失敗（タイムアウト、キー不正、想定外JSONなど）。HTTP 502 で返す。
 */
public class AiAgentException extends RuntimeException {

    public AiAgentException(String message) {
        super(message);
    }

    public AiAgentException(String message, Throwable cause) {
        super(message, cause);
    }
}
