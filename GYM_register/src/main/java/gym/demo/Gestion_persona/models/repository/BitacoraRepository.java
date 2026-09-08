package gym.demo.Gestion_persona.models.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import gym.demo.Gestion_persona.models.entity.BitacoraBean;

import java.util.List;

@Repository
public interface BitacoraRepository extends JpaRepository<BitacoraBean, Long> {

    List<BitacoraBean> findAllByOrderByFechaDesc();

    @Query("SELECT b FROM BitacoraBean b WHERE b.usuario.id_usuario = :idUsuario ORDER BY b.fecha DESC")
    List<BitacoraBean> findByIdUsuarioOrderByFechaDesc(@Param("idUsuario") Integer idUsuario);
}
