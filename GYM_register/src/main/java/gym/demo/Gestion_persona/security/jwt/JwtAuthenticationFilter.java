package gym.demo.Gestion_persona.security.jwt;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import gym.demo.Gestion_persona.security.entity.UserDetailsImpl;
import gym.demo.Gestion_persona.security.service.UserDetailsServiceImpl;

import java.io.IOException;
import java.time.ZoneId;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtProvider provider;

    @Autowired
    private UserDetailsServiceImpl service;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = provider.resolveToken(request);
            if (token != null && provider.validateToken(token)) {
                Claims claims = provider.getClaims(token);
                String username = claims.getSubject();

                UserDetails user = service.loadUserByUsername(username);

                if (isTokenOutdatedByPasswordChange(user, claims)) {
                    System.out.println("Token rechazado: la contraseña del usuario cambió después de emitirse el token: " + username);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "El token ya no es válido, inicie sesión nuevamente");
                    return;
                }

                Authentication auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);

                System.out.println("Autenticación exitosa para el usuario: " + username);
            } else {
                System.out.println("No se encontró un token válido en la solicitud.");
            }
        } catch (Exception e) {
            System.err.println("Error durante la autenticación JWT: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error en la autenticación: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    // Compara la marca de tiempo de cambio de contraseña embebida en el token contra el valor
    // actual almacenado para el usuario. Si la contraseña cambió después de emitirse el token,
    // este ya no es válido (evita que un token robado/antiguo siga funcionando tras un cambio de contraseña).
    private boolean isTokenOutdatedByPasswordChange(UserDetails user, Claims claims) {
        if (!(user instanceof UserDetailsImpl userDetailsImpl) || userDetailsImpl.getPasswordChangedAt() == null) {
            return false;
        }

        long currentPwdChangedAt = userDetailsImpl.getPasswordChangedAt()
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();

        long tokenPwdChangedAt = 0L;
        Object claimValue = claims.get("pwdChangedAt");
        if (claimValue instanceof Number number) {
            tokenPwdChangedAt = number.longValue();
        }

        return tokenPwdChangedAt < currentPwdChangedAt;
    }
}
