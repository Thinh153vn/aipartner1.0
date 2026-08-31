package com.brsecopilot.dto.sos;

/** SOS結果。リスク要約と先輩向け文面。 */
public record SosAlertResponse(
        String alertMessage,
        String slackMessageDraft
) {
}
