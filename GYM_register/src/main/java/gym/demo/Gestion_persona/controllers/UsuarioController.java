package gym.demo.Gestion_persona.controllers;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.dto.UserDto;
import gym.demo.Gestion_persona.services.UsuarioService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@Validated
public class UsuarioController {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService usuarioService;

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<ApiResponse> getAllUsuarios() {
        logger.info("Iniciando solicitud para obtener todos los usuarios.");
        List<UserDto> usuarios = usuarioService.getAllUsuarios();
        logger.info("Usuarios obtenidos: {}", usuarios.size());
        ApiResponse response = new ApiResponse(usuarios, HttpStatus.OK);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Obtener un usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUsuarioById(@PathVariable Integer id) {
        logger.info("Buscando usuario con ID: {}", id);
        Optional<UserDto> usuario = usuarioService.getUsuarioById(id);
        ApiResponse response;

        if (usuario.isPresent()) {
            logger.info("Usuario encontrado: {}", usuario.get());
            response = new ApiResponse(usuario.get(), HttpStatus.OK);
        } else {
            logger.warn("Usuario no encontrado con ID: {}", id);
            response = new ApiResponse(HttpStatus.NOT_FOUND, true, "Usuario no encontrado");
        }

        return new ResponseEntity<>(response, response.getStatus());
    }

    // Crear un nuevo usuario
    @PostMapping("/crear/{roleName}")
    public ResponseEntity<ApiResponse> createUsuarioByRole(
            @Valid @RequestBody UserDto usuarioDto,
            @PathVariable String roleName
    ) {
        logger.info("Iniciando creación de usuario con rol: {} y email: {}", roleName, usuarioDto.getEmail());
        ApiResponse response;
        try {
            UserDto createdUsuario = usuarioService.createUsuarioByRole(usuarioDto, roleName);
            logger.info("Usuario creado exitosamente con rol: {}", roleName);
            response = new ApiResponse(createdUsuario, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación al crear usuario: {}", e.getMessage());
            response = new ApiResponse(HttpStatus.BAD_REQUEST, true, e.getMessage());
        } catch (Exception e) {
            logger.error("Error interno al crear usuario por rol", e);
            response = new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, true, "Error al crear el usuario");
        }
        return new ResponseEntity<>(response, response.getStatus());
    }


    // Actualizar un usuario existente
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateUsuario(@PathVariable Integer id, @Valid @RequestBody UserDto usuarioDto) {
        logger.info("Iniciando actualización para el usuario con ID: {}", id);
        Optional<UserDto> updatedUsuario = usuarioService.updateUsuario(id, usuarioDto);
        ApiResponse response;

        if (updatedUsuario.isPresent()) {
            logger.info("Usuario actualizado exitosamente: {}", updatedUsuario.get());
            response = new ApiResponse(updatedUsuario.get(), HttpStatus.OK);
        } else {
            logger.warn("No se encontró usuario para actualizar con ID: {}", id);
            response = new ApiResponse(HttpStatus.NOT_FOUND, true, "Usuario no encontrado para actualizar");
        }

        return new ResponseEntity<>(response, response.getStatus());
    }

    // Eliminar un usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteUsuario(@PathVariable Integer id) {
        logger.info("Iniciando eliminación del usuario con ID: {}", id);
        boolean isDeleted = usuarioService.deleteUsuario(id);
        ApiResponse response;

        if (isDeleted) {
            logger.info("Usuario eliminado con éxito: ID {}", id);
            response = new ApiResponse(HttpStatus.NO_CONTENT, false, "Usuario eliminado con éxito");
        } else {
            logger.warn("Usuario no encontrado para eliminar: ID {}", id);
            response = new ApiResponse(HttpStatus.NOT_FOUND, true, "Usuario no encontrado para eliminar");
        }

        return new ResponseEntity<>(response, response.getStatus());
    }
}
