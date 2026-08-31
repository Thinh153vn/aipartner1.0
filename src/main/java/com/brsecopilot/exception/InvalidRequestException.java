package com.brsecopilot.exception;

/**
 * 複数項目の交差検証エラー（mode に応じた必須欠落など）。HTTP 400 で返す。
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
