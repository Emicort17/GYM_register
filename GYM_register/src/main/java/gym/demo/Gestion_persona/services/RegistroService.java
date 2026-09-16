package gym.demo.Gestion_persona.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.config.ApiResponse;
import gym.demo.Gestion_persona.models.dto.PersonaEstadoDto;
import gym.demo.Gestion_persona.models.dto.RegistroDto;
import gym.demo.Gestion_persona.models.entity.PersonBean;
import gym.demo.Gestion_persona.models.entity.RegistroBean;
import gym.demo.Gestion_persona.models.enums.TipoPago;
import gym.demo.Gestion_persona.models.repository.PersonRepository;
import gym.demo.Gestion_persona.models.repository.RegistroRepository;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RegistroService {

    // Días de anticipación antes del vencimiento en los que el estado pasa a AMARILLO
    private static final long DIAS_AVISO = 7;

    public static final String VERDE = "Activo";
    public static final String AMARILLO = "Proximo a vencer";
    public static final String ROJO = "Vencido";

    private final RegistroRepository repository;
    private final PersonRepository personRepository;
    private final BitacoraService bitacoraService;

    // Registrar un nuevo pago para una persona. La vigencia depende del tipo de pago
    @Transactional(rollbackFor = {SQLException.class})
    public ResponseEntity<ApiResponse> registrarPago(Integer personaId, LocalDate fechaPago, TipoPago tipoPago) {
        Optional<PersonBean> foundPersona = personRepository.findById(personaId);
        if (foundPersona.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Persona no encontrada"),
                    HttpStatus.NOT_FOUND
            );
        }

        LocalDate fecha = fechaPago != null ? fechaPago : LocalDate.now();
        TipoPago tipo = tipoPago != null ? tipoPago : TipoPago.MENSUAL;

        // Calcular fecha de vencimiento: si la persona ya tiene un pago activo en el futuro, se extiende a partir de esa fecha.
        Optional<RegistroBean> ultimoRegistro = repository.findFirstByPersonaIdOrderByFechaVencimientoDesc(personaId);
        LocalDate baseFecha = fecha;
        if (ultimoRegistro.isPresent() && ultimoRegistro.get().getFechaVencimiento() != null) {
            LocalDate ultimoVencimiento = ultimoRegistro.get().getFechaVencimiento();
            if (ultimoVencimiento.isAfter(fecha)) {
                baseFecha = ultimoVencimiento;
            }
        }
        LocalDate fechaVencimiento = baseFecha.plusMonths(tipo.getMeses());

        RegistroBean registro = RegistroBean.builder()
                .persona(foundPersona.get())
                .fechaPago(fecha)
                .tipoPago(tipo)
                .fechaVencimiento(fechaVencimiento)
                .fechaCreacion(LocalDateTime.now())
                .build();

        RegistroBean saved = repository.saveAndFlush(registro);
        bitacoraService.registrar("REGISTRAR_PAGO", "registro", saved.getId(),
                "Pago " + tipo + " registrado para persona ID " + personaId + ", vence " + saved.getFechaVencimiento());

        return new ResponseEntity<>(
                new ApiResponse(RegistroDto.fromEntity(saved, calcularEstado(saved.getFechaVencimiento())), HttpStatus.OK),
                HttpStatus.OK
        );
    }

    // Historial de pagos de una persona
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> historial(Integer personaId) {
        if (personRepository.findById(personaId).isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse(HttpStatus.NOT_FOUND, true, "Persona no encontrada"),
                    HttpStatus.NOT_FOUND
            );
        }
        List<RegistroDto> historial = repository.findByPersonaIdOrderByFechaPagoDesc(personaId).stream()
                .map(r -> RegistroDto.fromEntity(r, calcularEstado(r.getFechaVencimiento())))
                .collect(Collectors.toList());

        return new ResponseEntity<>(new ApiResponse(historial, HttpStatus.OK), HttpStatus.OK);
    }

    // Calcula el semáforo a partir de la fecha de vencimiento del último pago.
    public String calcularEstado(LocalDate fechaVencimiento) {
        if (fechaVencimiento == null) {
            return VERDE;
        }
        LocalDate hoy = LocalDate.now();
        if (fechaVencimiento.isBefore(hoy)) {
            return ROJO;
        }
        if (fechaVencimiento.isBefore(hoy.plusDays(7)) || fechaVencimiento.isEqual(hoy.plusDays(7))) {
            return AMARILLO;
        }
        return VERDE;
    }

    // Construye el DTO enriquecido de una persona (fecha de registro + estado de pago)
    @Transactional(readOnly = true)
    public PersonaEstadoDto toEstadoDto(PersonBean persona) {
        Optional<RegistroBean> ultimo = repository.findFirstByPersonaIdOrderByFechaVencimientoDesc(persona.getId());

        LocalDate ultimoPago = ultimo.map(RegistroBean::getFechaPago).orElse(null);
        LocalDate vencimiento = ultimo.map(RegistroBean::getFechaVencimiento).orElse(null);
        Long diasRestantes = vencimiento != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), vencimiento)
                : null;

        return PersonaEstadoDto.builder()
                .id(persona.getId())
                .name(persona.getName())
                .email(persona.getEmail())
                .telefono(persona.getTelefono())
                .age(persona.getAge())
                .fechaRegistro(persona.getFechaRegistro())
                .ultimoPago(ultimoPago)
                .fechaVencimiento(vencimiento)
                .diasRestantes(diasRestantes)
                .estado(calcularEstado(vencimiento))
                .build();
    }
}
