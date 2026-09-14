package gym.demo.Gestion_persona.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import gym.demo.Gestion_persona.models.entity.RoleBean;
import gym.demo.Gestion_persona.models.entity.UserBean;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Integer id_usuario;

    @NotBlank(message = "El correo no puede estar vacío")
    @Email(message = "El correo debe tener un formato válido")
    private String email;

    // WRITE_ONLY: se acepta al crear/autenticar, pero nunca se incluye en las respuestas de la API
    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String contrasena;

    private RoleBean role;

    // Constructor que recibe una entidad UsuarioBean
    public UserDto(UserBean usuarioEntity) {
        this.id_usuario = usuarioEntity.getId_usuario();
        this.email = usuarioEntity.getEmail();
        this.contrasena = usuarioEntity.getPassword();
        this.role = usuarioEntity.getRole();
    }

    // Método para convertir el DTO en una entidad UsuarioBean
    public UserBean toEntity() {
        UserBean usuario = new UserBean();
        usuario.setId_usuario(this.id_usuario);
        usuario.setEmail(this.email);
        usuario.setPassword(this.contrasena);
        usuario.setRole(this.role);
        usuario.setStatus(true); // Activo por defecto
        usuario.setBlocked(false); // No bloqueado por defecto
        return usuario;
    }
}
