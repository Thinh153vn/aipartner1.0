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
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

/**
 * REST API の例外を集約する。応答は {code, message, timestamp}。スタックトレースは返さない。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** DTO 単項目の @Valid エラー。 */
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

    /** JSON 不正、または body 欠落。 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        log.warn("リクエストボディの解析に失敗しました: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(),
                "リクエストの形式が正しくありません。入力内容をご確認ください。"));
    }

    /** パス／クエリの型不一致。 */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("パラメータの型が不正です: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(),
                "パラメータ「" + ex.getName() + "」の形式が正しくありません。"));
    }

    /** 複数項目の交差検証エラー。 */
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidRequest(InvalidRequestException ex) {
        log.warn("不正なリクエスト: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    /** AI呼び出し失敗（タイムアウト、キー不正、スキーマ不一致など）。 */
    @ExceptionHandler(AiAgentException.class)
    public ResponseEntity<ApiErrorResponse> handleAiAgentError(AiAgentException ex) {
        log.error("AIエージェント呼び出しに失敗しました: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiErrorResponse.of(HttpStatus.BAD_GATEWAY.value(),
                        "AIエージェントとの通信に失敗しました。しばらくしてから再度お試しください。"));
    }

    /**
     * Googleカレンダー同期エラー。原因と対処は GoogleCalendarService のメッセージをそのまま返す。
     */
    @ExceptionHandler(CalendarSyncException.class)
    public ResponseEntity<ApiErrorResponse> handleCalendarSyncError(CalendarSyncException ex) {
        log.error("Googleカレンダー同期に失敗しました: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiErrorResponse.of(HttpStatus.BAD_GATEWAY.value(), ex.getMessage()));
    }

    /** アップロードファイルのテキスト抽出失敗。 */
    @ExceptionHandler(FileExtractionException.class)
    public ResponseEntity<ApiErrorResponse> handleFileExtractionError(FileExtractionException ex) {
        log.warn("ファイルからのテキスト抽出に失敗しました: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    /** アップロードサイズ超過（application.yml の上限）。 */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("アップロードされたファイルのサイズが上限を超えています: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(),
                "ファイルサイズが上限（5MB）を超えています。より小さいファイルをお試しください。"));
    }

    /**
     * 静的リソース欠落（favicon 自動取得など）。業務エラーではないため DEBUG と 404 のみ。
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleStaticResourceNotFound(NoResourceFoundException ex) {
        log.debug("静的リソースが見つかりません: {}", ex.getResourcePath());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of(HttpStatus.NOT_FOUND.value(), "リソースが見つかりません。"));
    }

    /** 想定外エラーのフォールバック。内部情報は出さない。 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        log.error("予期しないエラーが発生しました", ex);
        return ResponseEntity.internalServerError()
                .body(ApiErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "サーバー内部でエラーが発生しました。"));
    }
}
