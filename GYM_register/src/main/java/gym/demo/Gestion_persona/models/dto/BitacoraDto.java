package gym.demo.Gestion_persona.models.dto;

import lombok.*;
import gym.demo.Gestion_persona.models.entity.BitacoraBean;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BitacoraDto {

    private Long id_bitacora;
    private LocalDateTime fecha;
    private String accion;
    private String tablaAfectada;
    private Integer registroAfectadoId;
    private String detalles;
    private Integer id_usuario;
    private String usuarioEmail;

    public static BitacoraDto fromEntity(BitacoraBean bitacora) {
        return BitacoraDto.builder()
                .id_bitacora(bitacora.getId_bitacora())
                .fecha(bitacora.getFecha())
                .accion(bitacora.getAccion())
                .tablaAfectada(bitacora.getTablaAfectada())
                .registroAfectadoId(bitacora.getRegistroAfectadoId())
                .detalles(bitacora.getDetalles())
                .id_usuario(bitacora.getUsuario() != null ? bitacora.getUsuario().getId_usuario() : null)
                .usuarioEmail(bitacora.getUsuario() != null ? bitacora.getUsuario().getEmail() : null)
                .build();
    }
}
