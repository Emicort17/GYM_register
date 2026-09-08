package gym.demo.Gestion_persona.models.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * DTO de respuesta para el listado/detalle de personas.
 * Incluye la fecha de registro de la persona y el estado de su
 * pago más reciente (VERDE, AMARILLO o ROJO), calculado dinámicamente.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersonaEstadoDto {

    private Integer id;
    private String name;
    private String email;
    private String telefono;
    private int age;

    // Fecha en la que la persona fue dada de alta (se guarda una sola vez)
    private LocalDate fechaRegistro;

    // Datos del último pago (pueden ser null si nunca se ha registrado un pago)
    private LocalDate ultimoPago;
    private LocalDate fechaVencimiento;
    private Long diasRestantes;

    // VERDE | AMARILLO | ROJO
    private String estado;
}
