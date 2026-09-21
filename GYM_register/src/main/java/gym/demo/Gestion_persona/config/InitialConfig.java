package gym.demo.Gestion_persona.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.models.entity.RoleBean;
import gym.demo.Gestion_persona.models.entity.UserBean;
import gym.demo.Gestion_persona.models.repository.RoleRepository;
import gym.demo.Gestion_persona.models.repository.UserRepository;

import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Order(1)
public class InitialConfig implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository usuarioRepository;
    private final PasswordEncoder encoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        // Eliminar restricción de clave única en la tabla de registro si existe en MySQL
        try {
            jdbcTemplate.execute("ALTER TABLE registro DROP INDEX uk_registro_persona_fecha");
        } catch (Exception ignored) {
            // La restricción ya no existe o la tabla es nueva
        }
        // Crear o buscar roles usando el patrón Builder
        RoleBean adminRole = getOrSaveRol(
                RoleBean.builder().id_role(null).name("ADMIN_ROLE").user(null).build()

        );
        // El rol USER_ROLE debe existir para que el auto-registro público pueda asignarlo
        getOrSaveRol(
                RoleBean.builder().id_role(null).name("USER_ROLE").user(null).build()
        );

        // El administrador por defecto solo se crea en una base vacía; si ya existe algún usuario
        // (p. ej. el admin con el correo real del cliente) no se vuelve a crear admin@example.com.
        if (usuarioRepository.count() == 0) {
            getOrSaveUser(
                    UserBean.builder()
                            .email("admin@example.com")
                            .password(encoder.encode("admin"))
                            .status(true)
                            .blocked(false)
                            .passwordChangedAt(LocalDateTime.now())
                            .role(adminRole)
                            .build()
            );
        }
    }

    // Método genérico para obtener o guardar un rol
    @Transactional
    public RoleBean getOrSaveRol(RoleBean role) {
        return roleRepository.findByName(role.getName())
                .orElseGet(() -> roleRepository.saveAndFlush(role));
    }

    // Método genérico para obtener o guardar un usuario
    @Transactional
    public UserBean getOrSaveUser(UserBean usuario) {
        return usuarioRepository.findByEmail(usuario.getEmail())
                .orElseGet(() -> usuarioRepository.saveAndFlush(usuario));
    }
}
