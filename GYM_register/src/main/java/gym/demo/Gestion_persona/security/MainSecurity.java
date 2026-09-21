package gym.demo.Gestion_persona.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import gym.demo.Gestion_persona.security.jwt.JwtAuthenticationFilter;
import gym.demo.Gestion_persona.security.service.UserDetailsServiceImpl;


import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class MainSecurity {
    // Los usuarios (incluidos los empleados) los crea únicamente un ADMIN desde el sistema;
    // no hay auto-registro público, porque USER_ROLE ahora puede ver y registrar socios.
    private static final String[] WHITE_LIST = {
            "/api/auth/**",
    };

    private final UserDetailsServiceImpl service;

    public MainSecurity(UserDetailsServiceImpl service) {
        this.service = service;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider dao = new DaoAuthenticationProvider();
        dao.setUserDetailsService(service);
        dao.setPasswordEncoder(passwordEncoder());
        return dao;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();

                    corsConfig.setAllowedOriginPatterns(List.of(
                            "http://localhost:*",
                            "http://127.0.0.1:*",
                            "https://localhost:*",
                            "https://jade-puppy-93fafa.netlify.app",
                            "https://gym-register-app.vercel.app",
                            "https://*.vercel.app"
                    ));
                    corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                    corsConfig.setAllowedHeaders(List.of("*"));
                    corsConfig.setAllowCredentials(true);
                    corsConfig.addExposedHeader("Authorization");
                    return corsConfig.applyPermitDefaultValues();
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req -> req
                        .requestMatchers(WHITE_LIST).permitAll()
                        // El propio usuario (ADMIN o USER) puede cambiar su propia contraseña;
                        // la pertenencia de la cuenta se valida en UsuarioService.changePassword.
                        .requestMatchers(HttpMethod.PATCH, "/api/usuarios/*/password").authenticated()
                        // Cualquier usuario autenticado puede consultar únicamente su propia cuenta
                        // (así el empleado puede cambiar su contraseña sin ver a los demás usuarios).
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
                        // El resto de la administración de usuarios y roles es exclusiva de ADMIN.
                        .requestMatchers("/api/usuarios/**").hasAuthority("ADMIN_ROLE")
                        .requestMatchers("/api/roles/**").hasAuthority("ADMIN_ROLE")
                        // Empleado (USER_ROLE): puede ver personas y sus pagos, registrar personas
                        // nuevas y registrar pagos. Editar y eliminar personas es solo de ADMIN.
                        .requestMatchers(HttpMethod.GET, "/api/personas/**").hasAnyAuthority("ADMIN_ROLE", "USER_ROLE")
                        .requestMatchers(HttpMethod.POST, "/api/personas/crear").hasAnyAuthority("ADMIN_ROLE", "USER_ROLE")
                        .requestMatchers(HttpMethod.POST, "/api/personas/*/pagos").hasAnyAuthority("ADMIN_ROLE", "USER_ROLE")
                        .requestMatchers("/api/personas/**").hasAuthority("ADMIN_ROLE")
                        .requestMatchers(HttpMethod.GET, "/api/bitacora/**").hasAuthority("ADMIN_ROLE")
                        .anyRequest().authenticated()
                )
                .headers(header -> header.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .logout(out -> out.logoutUrl("/api/auth/logout").clearAuthentication(true));
        return http.build();
    }
}
