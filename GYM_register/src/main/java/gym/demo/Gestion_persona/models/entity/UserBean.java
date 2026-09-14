package gym.demo.Gestion_persona.models.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder(builderClassName = "Builder", toBuilder = true)
@ToString
@Table(name = "usuario")
public class UserBean {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_usuario;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "contrasena", nullable = false)
    private String password;

    @Column(columnDefinition = "BOOL DEFAULT true")
    private Boolean status;

    @Column(columnDefinition = "BOOL DEFAULT false")
    private Boolean blocked;

    // Marca de tiempo del último cambio de contraseña: permite invalidar los JWT
    // emitidos antes de ese cambio (ver JwtProvider/JwtAuthenticationFilter).
    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @ManyToOne
    @JoinColumn(name = "id_role")
    private RoleBean role;

}
