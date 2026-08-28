package com.brsecopilot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

/**
 * Lưu/đọc cấu hình liên kết Google Calendar (calendarId + apiKey) vào 1 file JSON
 * cục bộ trên đĩa (KHÔNG dùng DB vì app hiện tại không có DB, và đây là bản demo
 * single-user cho hackathon).
 *
 * File này nằm ngoài classpath (mặc định ./data/calendar-settings.json, tính từ
 * thư mục chạy app) và đã được thêm vào .gitignore để KHÔNG BAO GIỜ bị commit lên
 * git cùng với API Key thật của người dùng.
 */
@Service
public class CalendarSettingsService {

    private static final Logger log = LoggerFactory.getLogger(CalendarSettingsService.class);

    private final Path settingsFilePath;
    private final ObjectMapper objectMapper;

    public CalendarSettingsService(
            @Value("${app.google-calendar.settings-file:./data/calendar-settings.json}") String settingsFile,
            ObjectMapper objectMapper) {
        this.settingsFilePath = Path.of(settingsFile);
        this.objectMapper = objectMapper;
    }

    /** Đọc cấu hình đã lưu, trả rỗng nếu chưa từng lưu hoặc file lỗi. */
    public Optional<StoredSettings> load() {
        if (!Files.exists(settingsFilePath)) {
            return Optional.empty();
        }
        try {
            byte[] content = Files.readAllBytes(settingsFilePath);
            return Optional.ofNullable(objectMapper.readValue(content, StoredSettings.class));
        } catch (IOException e) {
            log.warn("カレンダー設定ファイルの読み込みに失敗しました: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Lưu cấu hình mới. Nếu apiKey mới truyền vào rỗng/null, GIỮ NGUYÊN apiKey đã lưu
     * trước đó (cho phép người dùng chỉ đổi calendarId mà không cần nhập lại API Key).
     */
    public StoredSettings save(String calendarId, String apiKey) {
        String resolvedApiKey = (apiKey != null && !apiKey.isBlank())
                ? apiKey
                : load().map(StoredSettings::apiKey).orElse(null);

        StoredSettings toSave = new StoredSettings(calendarId, resolvedApiKey);
        try {
            Files.createDirectories(settingsFilePath.getParent());
            Files.write(settingsFilePath, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(toSave));
        } catch (IOException e) {
            log.error("カレンダー設定ファイルの保存に失敗しました path={} : {}", settingsFilePath, e.getMessage(), e);
            throw new IllegalStateException("カレンダー設定の保存に失敗しました。サーバーのディスク権限をご確認ください。", e);
        }
        log.info("Googleカレンダー設定を保存しました calendarId={}", calendarId);
        return toSave;
    }

    /** Dữ liệu lưu trên đĩa. record + Jackson mặc định đã đủ để (de)serialize JSON. */
    public record StoredSettings(String calendarId, String apiKey) {
    }
}
