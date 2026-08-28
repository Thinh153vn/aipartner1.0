package com.brsecopilot.exception;

import com.brsecopilot.dto.common.ApiErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.stream.Collectors;

/**
 * Xử lý lỗi tập trung cho toàn bộ REST API (/api/v1/copilot/**).
 * Luôn trả về JSON chuẩn {code, message, timestamp} để frontend hiển thị
 * Toast lỗi thân thiện, không bao giờ để lộ stack trace ra ngoài.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Lỗi @Valid trên các field đơn lẻ của request DTO (record). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getDefaultMessage())
                .filter(msg -> msg != null && !msg.isBlank())
                .distinct()
                .collect(Collectors.joining("; "));

        if (message.isBlank()) {
            message = "入力内容が正しくありません。";
        }

        log.warn("入力検証エラー: {}", message);
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(), message));
    }

    /** Request body gửi lên không phải JSON hợp lệ, hoặc thiếu body. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        log.warn("リクエストボディの解析に失敗しました: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(),
                "リクエストの形式が正しくありません。入力内容をご確認ください。"));
    }

    /** Path/Query variable sai kiểu dữ liệu (ví dụ truyền chữ vào field số). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("パラメータの型が不正です: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(),
                "パラメータ「" + ex.getName() + "」の形式が正しくありません。"));
    }

    /** Lỗi validate chéo giữa nhiều field (ví dụ thiếu field theo mode). */
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidRequest(InvalidRequestException ex) {
        log.warn("不正なリクエスト: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    /** Lỗi gọi AI thất bại (timeout, API key sai, JSON response sai schema...). */
    @ExceptionHandler(AiAgentException.class)
    public ResponseEntity<ApiErrorResponse> handleAiAgentError(AiAgentException ex) {
        log.error("AIエージェント呼び出しに失敗しました: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiErrorResponse.of(HttpStatus.BAD_GATEWAY.value(),
                        "AIエージェントとの通信に失敗しました。しばらくしてから再度お試しください。"));
    }

    /**
     * Lỗi đồng bộ Google Calendar: chưa cấu hình, API Key/Calendar ID sai, hoặc calendar
     * chưa public. Khác với AiAgentException, message ở đây được hiển thị trực tiếp cho
     * người dùng vì đã được viết rõ nguyên nhân + hướng xử lý ngay tại GoogleCalendarService.
     */
    @ExceptionHandler(CalendarSyncException.class)
    public ResponseEntity<ApiErrorResponse> handleCalendarSyncError(CalendarSyncException ex) {
        log.error("Googleカレンダー同期に失敗しました: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiErrorResponse.of(HttpStatus.BAD_GATEWAY.value(), ex.getMessage()));
    }

    /** Lỗi trích xuất text từ file upload (PDF/text): file rỗng, quá lớn, hoặc PDF lỗi. */
    @ExceptionHandler(FileExtractionException.class)
    public ResponseEntity<ApiErrorResponse> handleFileExtractionError(FileExtractionException ex) {
        log.warn("ファイルからのテキスト抽出に失敗しました: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    /** File upload vượt quá dung lượng cho phép (cấu hình ở application.yml). */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("アップロードされたファイルのサイズが上限を超えています: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(),
                "ファイルサイズが上限（5MB）を超えています。より小さいファイルをお試しください。"));
    }

    /** Fallback cho mọi lỗi không lường trước, tránh lộ thông tin nội bộ. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        log.error("予期しないエラーが発生しました", ex);
        return ResponseEntity.internalServerError()
                .body(ApiErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "サーバー内部でエラーが発生しました。"));
    }
}
