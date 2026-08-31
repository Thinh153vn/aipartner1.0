package com.brsecopilot.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * BYOK の APIキーをヘッダーから読む（値はログに出さない）。
 * 優先順: X-User-Api-Key → Authorization: Bearer → x-goog-api-key。
 */
@Component
public class UserApiKeyFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            UserApiKeyHolder.set(resolveApiKey(request));
            filterChain.doFilter(request, response);
        } finally {
            UserApiKeyHolder.clear();
        }
    }

    private static String resolveApiKey(HttpServletRequest request) {
        String userHeader = request.getHeader("X-User-Api-Key");
        if (hasText(userHeader)) {
            return userHeader;
        }

        String authorization = request.getHeader("Authorization");
        if (hasText(authorization) && authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authorization.substring(7);
        }

        String googleHeader = request.getHeader("x-goog-api-key");
        return hasText(googleHeader) ? googleHeader : null;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
