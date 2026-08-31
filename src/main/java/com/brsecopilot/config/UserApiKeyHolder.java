package com.brsecopilot.config;

/**
 * リクエスト単位で保持するユーザーAPIキー（BYOK）。
 * Filter がセットし AiChatExecutor が読む。finally で必ず消し、リクエスト間の漏れを防ぐ。
 */
public final class UserApiKeyHolder {

    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    private UserApiKeyHolder() {
    }

    public static void set(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            CURRENT.remove();
            return;
        }
        CURRENT.set(apiKey.trim());
    }

    public static String get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }
}
