package gym.demo.Gestion_persona.models.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import gym.demo.Gestion_persona.models.entity.PersonBean;

import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<PersonBean, Integer> {
    Optional<PersonBean> findById(Integer id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);
}
