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
 * Googleカレンダー設定（calendarId＋apiKey）をローカルJSONへ保存する（DBなしの単一ユーザー想定）。
 * 既定パスは実行ディレクトリの ./data/calendar-settings.json。.gitignore 済みで実キーをコミットしない。
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

    /** 保存済み設定を読む。未保存・破損時は空を返す。 */
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
     * 新設定を保存する。apiKey が空なら既存キーを残し、calendarId だけ変更できるようにする。
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

    /** ディスク上の保存形。record と Jackson で JSON 化する。 */
    public record StoredSettings(String calendarId, String apiKey) {
    }
}
