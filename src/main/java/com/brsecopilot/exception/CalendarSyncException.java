package com.brsecopilot.exception;

/**
 * Googleカレンダー同期失敗（未設定、キー／ID不正、非公開カレンダーなど）。
 * メッセージは利用者へそのまま返す。
 */
public class CalendarSyncException extends RuntimeException {

    public CalendarSyncException(String message) {
        super(message);
    }

    public CalendarSyncException(String message, Throwable cause) {
        super(message, cause);
    }
}
