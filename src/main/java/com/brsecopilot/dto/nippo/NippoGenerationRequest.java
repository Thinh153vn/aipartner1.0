package com.brsecopilot.dto.nippo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NippoGenerationRequest(
        @NotBlank(message = "作業ログを入力してください")
        @Size(max = 4000, message = "作業ログは4000文字以内で入力してください")
        String rawLogs
) {
}
