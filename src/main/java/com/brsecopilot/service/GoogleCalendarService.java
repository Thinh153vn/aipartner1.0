package com.brsecopilot.service;

import com.brsecopilot.dto.calendar.SyncedTaskDto;
import com.brsecopilot.exception.CalendarSyncException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

/**
 * Gọi trực tiếp Google Calendar API v3 (REST, KHÔNG dùng OAuth) bằng 1 API Key.
 *
 * Lưu ý quan trọng: với API Key (không OAuth), Google chỉ cho đọc các calendar đã
 * được người dùng đặt ở chế độ "Công khai" (Public) trong phần Cài đặt chia sẻ của
 * Google Calendar. Đây là lựa chọn được xác nhận với người dùng để giữ kiến trúc
 * đơn giản cho bản demo hackathon (không cần luồng OAuth2 phức tạp).
 */
@Service
public class GoogleCalendarService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarService.class);
    private static final String EVENTS_URL_TEMPLATE =
            "https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events";

    private final RestClient restClient = RestClient.create();

    /** Lấy toàn bộ event trong khoảng [timeMin, timeMax) của 1 calendar, map thành SyncedTaskDto. */
    public List<SyncedTaskDto> fetchEvents(String calendarId, String apiKey, LocalDate timeMin, LocalDate timeMax) {
        log.info("Googleカレンダーからイベント取得を開始します calendarId={} timeMin={} timeMax={}",
                calendarId, timeMin, timeMax);

        GoogleCalendarEventsResponse response;
        try {
            response = restClient.get()
                    .uri(EVENTS_URL_TEMPLATE + "?key={apiKey}&timeMin={timeMin}&timeMax={timeMax}"
                                    + "&singleEvents=true&orderBy=startTime&maxResults=250",
                            calendarId, apiKey,
                            timeMin.atStartOfDay(ZoneOffset.UTC).toInstant(),
                            timeMax.atStartOfDay(ZoneOffset.UTC).toInstant())
                    .retrieve()
                    .body(GoogleCalendarEventsResponse.class);
        } catch (RestClientResponseException e) {
            throw toFriendlyException(e);
        } catch (Exception e) {
            log.error("Googleカレンダーとの通信で予期しないエラーが発生しました", e);
            throw new CalendarSyncException(
                    "Googleカレンダーとの通信に失敗しました。ネットワーク環境をご確認のうえ、再度お試しください。", e);
        }

        if (response == null || response.items() == null) {
            log.info("Googleカレンダーからのイベントが0件でした calendarId={}", calendarId);
            return List.of();
        }

        List<SyncedTaskDto> tasks = response.items().stream()
                .map(this::toSyncedTaskOrNull)
                .filter(Objects::nonNull)
                .toList();

        log.info("Googleカレンダーからイベントを取得しました calendarId={} count={}", calendarId, tasks.size());
        return tasks;
    }

    private SyncedTaskDto toSyncedTaskOrNull(GoogleCalendarEvent event) {
        LocalDate dueDate = extractDueDate(event);
        if (dueDate == null) {
            return null; // Event không có start hợp lệ (hiếm), bỏ qua để không vỡ luồng sync.
        }
        String title = (event.summary() != null && !event.summary().isBlank()) ? event.summary() : "(タイトルなし)";
        return new SyncedTaskDto("gcal-" + event.id(), title, dueDate);
    }

    private LocalDate extractDueDate(GoogleCalendarEvent event) {
        if (event.start() == null) {
            return null;
        }
        if (event.start().date() != null) {
            return LocalDate.parse(event.start().date());
        }
        if (event.start().dateTime() != null) {
            return OffsetDateTime.parse(event.start().dateTime(), DateTimeFormatter.ISO_OFFSET_DATE_TIME).toLocalDate();
        }
        return null;
    }

    /** Chuyển lỗi HTTP thô từ Google thành message tiếng Nhật dễ hiểu, chỉ rõ nguyên nhân + hướng xử lý. */
    private CalendarSyncException toFriendlyException(RestClientResponseException e) {
        int status = e.getStatusCode().value();
        log.warn("Google Calendar API がエラーを返しました status={} body={}", status, e.getResponseBodyAsString());

        String message = switch (status) {
            case 403 -> "このカレンダーは非公開、またはAPIキーが正しくありません。"
                    + "Googleカレンダーの「設定と共有」で該当カレンダーを「公開」に設定し、APIキーをご確認ください。";
            case 404 -> "指定されたカレンダーIDが見つかりません。カレンダーIDをご確認ください。";
            case 400 -> "リクエスト内容が正しくありません。カレンダーIDまたはAPIキーの形式をご確認ください。";
            default -> "Googleカレンダーとの同期に失敗しました（エラーコード: " + status + "）。しばらくしてから再度お試しください。";
        };
        return new CalendarSyncException(message, e);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GoogleCalendarEventsResponse(List<GoogleCalendarEvent> items) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GoogleCalendarEvent(String id, String summary, GoogleEventDateTime start) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GoogleEventDateTime(String date, String dateTime) {
    }
}
