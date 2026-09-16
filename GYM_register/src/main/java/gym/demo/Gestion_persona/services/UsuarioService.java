package gym.demo.Gestion_persona.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.exceptions.InvalidCurrentPasswordException;
import gym.demo.Gestion_persona.exceptions.ResourceNotFoundException;
import gym.demo.Gestion_persona.models.dto.UserDto;
import gym.demo.Gestion_persona.models.entity.RoleBean;
import gym.demo.Gestion_persona.models.entity.UserBean;
import gym.demo.Gestion_persona.models.repository.RoleRepository;
import gym.demo.Gestion_persona.models.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$");

    @Autowired
    private UserRepository usuarioDao;

    @Autowired
    private RoleRepository roleDao;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BitacoraService bitacoraService;

    public UsuarioService(UserRepository usuarioDao, RoleRepository roleDao, PasswordEncoder passwordEncoder, BitacoraService bitacoraService) {
        this.usuarioDao = usuarioDao;
        this.roleDao = roleDao;
        this.passwordEncoder = passwordEncoder;
        this.bitacoraService = bitacoraService;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsuarios() {
        return usuarioDao.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> getUsuarioById(Integer id) {
        return usuarioDao.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> getUsuarioByEmail(String email) {
        return usuarioDao.findByEmail(email).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserBean> findByMail(String mail) {
        return usuarioDao.findByEmail(mail);
    }

    @Transactional
    public UserDto saveUsuario(UserDto UserDto) {
        UserBean usuario = new UserBean();
        setUsuarioData(usuario, UserDto, true);
        UserBean savedUsuario = usuarioDao.save(usuario);
        return toDTO(savedUsuario);
    }

    // Actualización PARCIAL de datos personales del usuario (no toca la contraseña,
    // que se modifica exclusivamente mediante changePassword()). Los campos no enviados
    // en el DTO se conservan sin cambios.
    @Transactional
    public Optional<UserDto> updateUsuario(Integer id, UserDto UserDto) {
        Optional<UserBean> existingUsuario = usuarioDao.findById(id);
        if (existingUsuario.isPresent()) {
            UserBean usuario = existingUsuario.get();

            if (UserDto.getEmail() != null) {
                if (!EMAIL_PATTERN.matcher(UserDto.getEmail()).matches()) {
                    throw new IllegalArgumentException("El correo debe tener un formato válido");
                }
                if (!UserDto.getEmail().equalsIgnoreCase(usuario.getEmail())
                        && usuarioDao.existsByEmail(UserDto.getEmail())) {
                    throw new IllegalArgumentException("El correo ya está registrado");
                }
            }

            setUsuarioData(usuario, UserDto, false);
            usuarioDao.save(usuario);
            bitacoraService.registrar("ACTUALIZAR_USUARIO", "usuario", id, "Actualización de usuario: " + usuario.getEmail());
            return Optional.of(toDTO(usuario));
        }
        return Optional.empty();
    }

    // Cambio de contraseña propio: exige la contraseña actual y solo permite que el
    // usuario autenticado modifique su propia cuenta (nunca la de otro usuario).
    @Transactional
    public void changePassword(Integer id, String authenticatedEmail, String currentPassword, String newPassword) {
        UserBean usuario = usuarioDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!usuario.getEmail().equalsIgnoreCase(authenticatedEmail)) {
            throw new AccessDeniedException("No tiene permisos para modificar la contraseña de este usuario");
        }

        if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            throw new InvalidCurrentPasswordException("La contraseña actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuario.setPasswordChangedAt(LocalDateTime.now());
        usuarioDao.save(usuario);
        bitacoraService.registrar("CAMBIAR_CONTRASENA", "usuario", id, "Cambio de contraseña del usuario: " + usuario.getEmail());
    }

    @Transactional
    public boolean deleteUsuario(Integer id) {
        Optional<UserBean> existingUsuario = usuarioDao.findById(id);
        if (existingUsuario.isPresent()) {
            usuarioDao.deleteById(id);
            bitacoraService.registrar("ELIMINAR_USUARIO", "usuario", id, "Baja de usuario: " + existingUsuario.get().getEmail());
            return true;
        }
        return false;
    }

    private void setUsuarioData(UserBean usuario, UserDto UserDto, boolean isNew) {
        logger.info("Iniciando la configuración del usuario...");

        if (UserDto.getEmail() != null) {
            usuario.setEmail(UserDto.getEmail());
        } else if (isNew) {
            throw new IllegalArgumentException("El correo es obligatorio para un nuevo usuario.");
        }

        // La contraseña solo se establece al crear el usuario. Para un usuario existente,
        // el cambio de contraseña se hace exclusivamente a través de changePassword().
        if (isNew) {
            if (UserDto.getContrasena() != null && !UserDto.getContrasena().isBlank()) {
                usuario.setPassword(passwordEncoder.encode(UserDto.getContrasena()));
                usuario.setPasswordChangedAt(LocalDateTime.now());
            } else {
                throw new IllegalArgumentException("La contraseña es obligatoria para un nuevo usuario.");
            }
        }

        if (UserDto.getRole() != null && UserDto.getRole().getName() != null) {
            Optional<RoleBean> role = roleDao.findByName(UserDto.getRole().getName());
            role.ifPresent(usuario::setRole);
        }

        if (isNew) {
            usuario.setStatus(true);
            usuario.setBlocked(false);
        }
        logger.info("Configuración del usuario completada: {}", usuario);
    }

    @Transactional
    public UserDto createUsuarioByRole(UserDto UserDto, String roleName) {
        logger.info("Buscando rol con nombre: {}", roleName);

        // Buscar el rol en la base de datos o crearlo automáticamente si es un rol de sistema
        Optional<RoleBean> roleOpt = roleDao.findByName(roleName);
        RoleBean role;
        if (roleOpt.isEmpty()) {
            if ("USER_ROLE".equals(roleName) || "ADMIN_ROLE".equals(roleName)) {
                logger.info("El rol {} no existía en la BD, creándolo automáticamente...", roleName);
                role = roleDao.saveAndFlush(RoleBean.builder().name(roleName).build());
            } else {
                logger.error("Rol no encontrado: {}", roleName);
                throw new IllegalArgumentException("El rol especificado no existe: " + roleName);
            }
        } else {
            role = roleOpt.get();
        }

        // Verifica si el correo ya está registrado
        if (usuarioDao.existsByEmail(UserDto.getEmail())) {
            logger.warn("Intento de registro con correo ya existente: {}", UserDto.getEmail());
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        // Crear y asignar el usuario con el rol encontrado
        UserBean usuario = new UserBean();
        logger.info("Asignando datos al usuario con email: {}", UserDto.getEmail());
        setUsuarioData(usuario, UserDto, true);

        // Asignar el rol encontrado
        usuario.setRole(role);
        logger.info("Rol asignado: {}", role.getName());

        // Guardar el usuario en la base de datos
        UserBean savedUsuario = usuarioDao.save(usuario);
        logger.info("Usuario creado con éxito: ID {}", savedUsuario.getId_usuario());
        bitacoraService.registrar("CREAR_USUARIO", "usuario", savedUsuario.getId_usuario(),
                "Alta de usuario: " + savedUsuario.getEmail() + " con rol " + role.getName());

        return toDTO(savedUsuario);
    }


    private UserDto toDTO(UserBean usuario) {
        return UserDto.builder()
                .id_usuario(usuario.getId_usuario())
                .email(usuario.getEmail())
                .contrasena(usuario.getPassword())
                .role(usuario.getRole())
                .build();
    }
}
