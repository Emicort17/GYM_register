package gym.demo.Gestion_persona.models.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import gym.demo.Gestion_persona.models.entity.RegistroBean;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroRepository extends JpaRepository<RegistroBean, Integer> {

    // Último pago registrado por fecha de vencimiento
    Optional<RegistroBean> findFirstByPersonaIdOrderByFechaVencimientoDesc(Integer personaId);

    // Último pago registrado por fecha de pago
    Optional<RegistroBean> findFirstByPersonaIdOrderByFechaPagoDesc(Integer personaId);

    // Historial completo de pagos de una persona, del más reciente al más antiguo
    List<RegistroBean> findByPersonaIdOrderByFechaPagoDesc(Integer personaId);

    // Evita registrar dos veces el pago de la misma persona en la misma fecha
    boolean existsByPersonaIdAndFechaPago(Integer personaId, LocalDate fechaPago);
}
