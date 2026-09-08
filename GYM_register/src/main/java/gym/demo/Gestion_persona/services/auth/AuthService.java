package gym.demo.Gestion_persona.services.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.controllers.auth.Dto.SignedDto;
import gym.demo.Gestion_persona.models.dto.UserDto;
import gym.demo.Gestion_persona.models.entity.UserBean;
import gym.demo.Gestion_persona.security.jwt.JwtProvider;
import gym.demo.Gestion_persona.services.UsuarioService;


import java.util.Optional;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioService service;
    private final AuthenticationManager manager;
    private final JwtProvider provider;

    public AuthService(UsuarioService service, AuthenticationManager manager, JwtProvider provider) {
        this.service = service;
        this.manager = manager;
        this.provider = provider;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> signIn(String usuario, String contrasenia) {
        try {
            logger.info("Iniciando proceso de autenticación para el usuario: {}", usuario);

            Optional<UserBean> foundUsuario = service.findByMail(usuario);
            if (foundUsuario.isEmpty()) {
                logger.warn("Usuario no encontrado: {}", usuario);
                return new ResponseEntity<>(
                        new ApiResponse(HttpStatus.NOT_FOUND, true, "Usuario no encontrado"),
                        HttpStatus.NOT_FOUND
                );
            }

            UserBean user = foundUsuario.get();
            logger.info("Usuario encontrado: {}", user.getEmail());

            if (!user.getStatus()) {
                logger.warn("El usuario está inactivo: {}", user.getEmail());
                return new ResponseEntity<>(
                        new ApiResponse(HttpStatus.UNAUTHORIZED, true, "Inactivo"),
                        HttpStatus.UNAUTHORIZED
                );
            }

            if (user.getBlocked()) {
                logger.warn("El usuario está bloqueado: {}", user.getEmail());
                return new ResponseEntity<>(
                        new ApiResponse(HttpStatus.UNAUTHORIZED, true, "Bloqueado"),
                        HttpStatus.UNAUTHORIZED
                );
            }

            logger.info("Autenticando credenciales para el usuario: {}", usuario);
            Authentication auth = manager.authenticate(
                    new UsernamePasswordAuthenticationToken(usuario, contrasenia)
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            logger.info("Generando token JWT para el usuario: {}", usuario);
            String token = provider.generateToken(auth);

            UserDto usuarioDto = new UserDto(user);

            SignedDto signedDto = new SignedDto(token, "Bearer", usuarioDto, null);
            logger.info("Autenticación exitosa para el usuario: {}", usuario);

            return new ResponseEntity<>(
                    new ApiResponse(signedDto, HttpStatus.OK),
                    HttpStatus.OK
            );

        } catch (BadCredentialsException e) {
            logger.error("Credenciales incorrectas para el usuario: {}", usuario);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.BAD_REQUEST, true, "Las credenciales no coinciden"),
                    HttpStatus.BAD_REQUEST
            );
        } catch (DisabledException e) {
            logger.error("El usuario está deshabilitado: {}", usuario);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.UNAUTHORIZED, true, "Usuario desactivado"),
                    HttpStatus.UNAUTHORIZED
            );
        } catch (Exception e) {
            logger.error("Error inesperado durante el inicio de sesión para el usuario: {}", usuario, e);
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, true, "Error interno en el servidor"),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
