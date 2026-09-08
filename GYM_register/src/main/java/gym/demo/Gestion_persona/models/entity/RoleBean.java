package gym.demo.Gestion_persona.models.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder(builderClassName = "Builder", toBuilder = true)
@Table(name = "role")
public class RoleBean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_role;

    @Column(name = "nombre", nullable = false)
    private String name;

    @OneToMany(mappedBy = "role")
    @JsonIgnore
    private Set<UserBean> user;

}