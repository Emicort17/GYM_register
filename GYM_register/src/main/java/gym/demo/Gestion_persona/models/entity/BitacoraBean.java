package gym.demo.Gestion_persona.models.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@ToString
@Table(name = "bitacora")
public class BitacoraBean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_bitacora;

    @Column(name = "fecha", columnDefinition = "DATETIME", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "accion", length = 100, nullable = false)
    private String accion;

    @Column(name = "tabla_afectada", length = 50)
    private String tablaAfectada;

    @Column(name = "registro_afectado_id")
    private Integer registroAfectadoId;

    @Column(name = "detalles", columnDefinition = "TEXT")
    private String detalles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private UserBean usuario;
}
