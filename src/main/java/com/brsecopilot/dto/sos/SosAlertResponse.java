package com.brsecopilot.dto.sos;

public record SosAlertResponse(
        String alertMessage,
        String slackMessageDraft
) {
}
