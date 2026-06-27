package com.vehicle.service.gateway.filter;

import com.vehicle.service.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (org.springframework.http.HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
                return chain.filter(exchange);
            }

            if (exchange.getRequest().getURI().getPath().startsWith("/auth/")) {
                return chain.filter(exchange);
            }

            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }
            try {
                jwtUtil.validateToken(authHeader);
                Claims claims = jwtUtil.getClaims(authHeader);
                String role = String.valueOf(claims.get("role"));
                String path = exchange.getRequest().getURI().getPath();
                String method = exchange.getRequest().getMethod().name();

                // RBAC Logic: Only Admin can modify packages
                if (path.startsWith("/packages") && !method.equals("GET")) {
                    if (!"ADMIN".equals(role)) {
                        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete();
                    }
                }

                // RBAC Logic: Only Admin, Mechanic, Service Advisor can update appointment status
                if (path.startsWith("/appointments") && method.equals("PATCH")) {
                    if (!"ADMIN".equals(role) && !"MECHANIC".equals(role) && !"SERVICE_ADVISOR".equals(role)) {
                        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete();
                    }
                }

                ServerHttpRequest request = exchange.getRequest()
                        .mutate()
                        .header("loggedInUser", claims.getSubject())
                        .header("role", role)
                        .build();
                exchange = exchange.mutate().request(request).build();

            } catch (Exception e) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            return chain.filter(exchange);
        };
    }

    public static class Config {
    }
}
