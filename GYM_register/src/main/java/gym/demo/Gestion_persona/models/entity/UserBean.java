package gym.demo.Gestion_persona.models.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "contrasena", nullable = false)
    private String password;

    @Column(columnDefinition = "BOOL DEFAULT true")
    private Boolean status;

    @Column(columnDefinition = "BOOL DEFAULT false")
    private Boolean blocked;

    @ManyToOne
    @JoinColumn(name = "id_role")
    private RoleBean role;

}
