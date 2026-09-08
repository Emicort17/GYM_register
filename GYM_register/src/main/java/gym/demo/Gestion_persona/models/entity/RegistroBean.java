package gym.demo.Gestion_persona.models.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Representa un "pago" adjuntado a una persona.
 * Cada pago tiene una vigencia de un mes a partir de su fecha.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@ToString
@Table(name = "registro")
public class RegistroBean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PersonBean persona;

    // Fecha en la que se realizó el pago
    @Column(name = "fecha_pago", columnDefinition = "DATETIME", nullable = false)
    private LocalDate fechaPago;

    // Fecha en la que vence el pago (fechaPago + 1 mes)
    @Column(name = "fecha_vencimiento", columnDefinition = "DATETIME", nullable = false)
    private LocalDate fechaVencimiento;

    // Fecha/hora en la que se registró el pago en el sistema (auditoría)
    @Column(name = "fecha_creacion", columnDefinition = "DATETIME", nullable = false)
    private LocalDateTime fechaCreacion;
}
