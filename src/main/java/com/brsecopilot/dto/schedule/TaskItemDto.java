package com.brsecopilot.dto.schedule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * カレンダー上の既存タスク（クライアント保持。サーバーDBは無い）。
 */
public record TaskItemDto(
        @NotBlank(message = "タスクIDは必須です") String id,
        @NotBlank(message = "タスクタイトルは必須です") String title,
        @NotNull(message = "期日は必須です") LocalDate dueDate
) {
}
