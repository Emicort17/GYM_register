package gym.demo.Gestion_persona.security.service;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gym.demo.Gestion_persona.models.entity.UserBean;
import gym.demo.Gestion_persona.security.entity.UserDetailsImpl;
import gym.demo.Gestion_persona.services.UsuarioService;


import java.util.Optional;

@Service
@Transactional
public class UserDetailsServiceImpl implements UserDetailsService {

    @Lazy
    private final UsuarioService service;

    public UserDetailsServiceImpl(@Lazy UsuarioService service) {
        this.service = service;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usuario) throws UsernameNotFoundException {
        Optional<UserBean> foundUser = service.findByMail(usuario);
        if (foundUser.isPresent())
            return UserDetailsImpl.build(foundUser.get());
        throw new UsernameNotFoundException("UserNotFound");
    }
}

