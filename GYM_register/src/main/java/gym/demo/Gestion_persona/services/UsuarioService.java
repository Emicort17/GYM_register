package gym.demo.Gestion_persona.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.models.dto.UserDto;
import gym.demo.Gestion_persona.models.entity.RoleBean;
import gym.demo.Gestion_persona.models.entity.UserBean;
import gym.demo.Gestion_persona.models.repository.RoleRepository;
import gym.demo.Gestion_persona.models.repository.UserRepository;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

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

    @Transactional
    public Optional<UserDto> updateUsuario(Integer id, UserDto UserDto) {
        Optional<UserBean> existingUsuario = usuarioDao.findById(id);
        if (existingUsuario.isPresent()) {
            UserBean usuario = existingUsuario.get();
            setUsuarioData(usuario, UserDto, false);
            usuarioDao.save(usuario);
            bitacoraService.registrar("ACTUALIZAR_USUARIO", "usuario", id, "Actualización de usuario: " + usuario.getEmail());
            return Optional.of(toDTO(usuario));
        }
        return Optional.empty();
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
        usuario.setEmail(UserDto.getEmail());

        if (UserDto.getContrasena() != null && !UserDto.getContrasena().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(UserDto.getContrasena());
            usuario.setPassword(encodedPassword);
        } else if (isNew) {
            throw new IllegalArgumentException("La contraseña es obligatoria para un nuevo usuario.");
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

        // Buscar el rol en la base de datos
        Optional<RoleBean> role = roleDao.findByName(roleName);
        if (!role.isPresent()) {
            logger.error("Rol no encontrado: {}", roleName);
            throw new IllegalArgumentException("El rol especificado no existe: " + roleName);
        }

        // Crear y asignar el usuario con el rol encontrado
        UserBean usuario = new UserBean();
        logger.info("Asignando datos al usuario con email: {}", UserDto.getEmail());
        setUsuarioData(usuario, UserDto, true);

        // Asignar el rol encontrado
        usuario.setRole(role.get());
        logger.info("Rol asignado: {}", role.get().getName());

        // Guardar el usuario en la base de datos
        UserBean savedUsuario = usuarioDao.save(usuario);
        logger.info("Usuario creado con éxito: ID {}", savedUsuario.getId_usuario());
        bitacoraService.registrar("CREAR_USUARIO", "usuario", savedUsuario.getId_usuario(),
                "Alta de usuario: " + savedUsuario.getEmail() + " con rol " + role.get().getName());

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
