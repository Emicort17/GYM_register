package gym.demo.Gestion_persona.models.dto;

import lombok.*;
import gym.demo.Gestion_persona.models.entity.RegistroBean;
import gym.demo.Gestion_persona.models.enums.TipoPago;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistroDto {

    private Integer id;

    private Integer personaId;

    // Fecha del pago. Si no se envía al crear, se usa la fecha actual.
    private LocalDate fechaPago;

    // Periodicidad del pago (MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL). Si no se envía al
    // crear, se asume MENSUAL.
    private TipoPago tipoPago;

    private LocalDate fechaVencimiento;

    private LocalDateTime fechaCreacion;

    // Estado calculado al momento de responder: VERDE, AMARILLO o ROJO
    private String estado;

    public static RegistroDto fromEntity(RegistroBean registro, String estado) {
        return RegistroDto.builder()
                .id(registro.getId())
                .personaId(registro.getPersona() != null ? registro.getPersona().getId() : null)
                .fechaPago(registro.getFechaPago())
                .tipoPago(registro.getTipoPago())
                .fechaVencimiento(registro.getFechaVencimiento())
                .fechaCreacion(registro.getFechaCreacion())
                .estado(estado)
                .build();
    }
}
