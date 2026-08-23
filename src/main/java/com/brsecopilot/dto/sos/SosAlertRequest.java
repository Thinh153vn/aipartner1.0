package com.brsecopilot.dto.sos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SosAlertRequest(
        @NotBlank(message = "ファイル名は必須です") String fileName,
        @Min(value = 1, message = "停滞時間は1分以上を指定してください")
        @Max(value = 1440, message = "停滞時間は1440分以内で指定してください")
        int stuckMinutes
) {
}
