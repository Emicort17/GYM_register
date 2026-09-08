package gym.demo.Gestion_persona.models.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import gym.demo.Gestion_persona.models.entity.RegistroBean;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroRepository extends JpaRepository<RegistroBean, Integer> {

    // Último pago registrado para una persona (el que define su estado actual)
    Optional<RegistroBean> findFirstByPersonaIdOrderByFechaPagoDesc(Integer personaId);

    // Historial completo de pagos de una persona, del más reciente al más antiguo
    List<RegistroBean> findByPersonaIdOrderByFechaPagoDesc(Integer personaId);
}
