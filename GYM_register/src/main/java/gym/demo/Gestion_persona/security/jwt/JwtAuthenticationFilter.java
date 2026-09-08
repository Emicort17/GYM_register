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
import gym.demo.Gestion_persona.security.service.UserDetailsServiceImpl;

import java.io.IOException;

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

}
