package gym.demo.Gestion_persona.models.dto;

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

    private String email;
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
