package gym.demo.Gestion_persona.models.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import gym.demo.Gestion_persona.models.enums.TipoPago;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Representa un "pago" adjuntado a una persona.
 * La vigencia del pago depende de su tipo (mensual, trimestral, semestral o anual).
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

    // Fecha en la que se realizó el pago. No puede repetirse para la misma persona
    // (ver restricción UNIQUE arriba y la validación de negocio en RegistroService).
    @Column(name = "fecha_pago", columnDefinition = "DATETIME", nullable = false)
    private LocalDate fechaPago;

    // Periodicidad del pago: determina cuántos meses de vigencia otorga
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pago")
    private TipoPago tipoPago;

    // Fecha en la que vence el pago (fechaPago + meses según tipoPago)
    @Column(name = "fecha_vencimiento", columnDefinition = "DATETIME", nullable = false)
    private LocalDate fechaVencimiento;

    // Fecha/hora en la que se registró el pago en el sistema (auditoría)
    @Column(name = "fecha_creacion", columnDefinition = "DATETIME", nullable = false)
    private LocalDateTime fechaCreacion;
}
