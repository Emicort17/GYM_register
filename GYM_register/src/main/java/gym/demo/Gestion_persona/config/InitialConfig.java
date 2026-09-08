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

@Configuration
@RequiredArgsConstructor
@Order(1)
public class InitialConfig implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository usuarioRepository;
    private final PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Crear o buscar roles usando el patrón Builder
        RoleBean adminRole = getOrSaveRol(
                RoleBean.builder().id_role(null).name("ADMIN_ROLE").user(null).build()

        );

        // Crear o buscar usuario administrador usando el patrón Builder
        getOrSaveUser(
                UserBean.builder()
                        .email("admin@example.com")
                        .password(encoder.encode("admin"))
                        .status(true)
                        .blocked(false)
                        .role(adminRole)
                        .build()
        );
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
