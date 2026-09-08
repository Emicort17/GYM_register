package gym.demo.Gestion_persona.models.dto;

import lombok.*;
import gym.demo.Gestion_persona.models.entity.RegistroBean;

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

    private LocalDate fechaVencimiento;

    private LocalDateTime fechaCreacion;

    // Estado calculado al momento de responder: VERDE, AMARILLO o ROJO
    private String estado;

    public static RegistroDto fromEntity(RegistroBean registro, String estado) {
        return RegistroDto.builder()
                .id(registro.getId())
                .personaId(registro.getPersona() != null ? registro.getPersona().getId() : null)
                .fechaPago(registro.getFechaPago())
                .fechaVencimiento(registro.getFechaVencimiento())
                .fechaCreacion(registro.getFechaCreacion())
                .estado(estado)
                .build();
    }
}
