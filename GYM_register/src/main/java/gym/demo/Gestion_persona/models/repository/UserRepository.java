package gym.demo.Gestion_persona.models.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import gym.demo.Gestion_persona.models.entity.UserBean;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserBean, Integer> {
    Optional<UserBean> findByEmail(String email);

}
