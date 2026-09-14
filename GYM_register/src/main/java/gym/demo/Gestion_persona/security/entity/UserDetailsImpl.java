package gym.demo.Gestion_persona.security.entity;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import gym.demo.Gestion_persona.models.entity.UserBean;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {

    private String username;
    private String password;
    private boolean isBlocked;
    private boolean isEnabled;
    private Collection<? extends GrantedAuthority> authorities;
    // Marca de tiempo del último cambio de contraseña, usada para invalidar los JWT
    // emitidos antes de ese cambio (ver JwtProvider/JwtAuthenticationFilter). Puede ser null.
    private LocalDateTime passwordChangedAt;

    public UserDetailsImpl(String username, String password, boolean isBlocked, boolean isEnabled, Collection<? extends GrantedAuthority> authorities) {
        this(username, password, isBlocked, isEnabled, authorities, null);
    }

    public UserDetailsImpl(String username, String password, boolean isBlocked, boolean isEnabled,
                            Collection<? extends GrantedAuthority> authorities, LocalDateTime passwordChangedAt) {
        this.username = username;
        this.password = password;
        this.isBlocked = isBlocked;
        this.isEnabled = isEnabled;
        this.authorities = authorities;
        this.passwordChangedAt = passwordChangedAt;
    }

    public static UserDetailsImpl build(UserBean user) {
        if (user.getRole() == null || user.getRole().getName() == null) {
            throw new IllegalArgumentException("El usuario no tiene un rol válido asignado: " + user.getEmail());
        }

        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().getName());
        return new UserDetailsImpl(
                user.getEmail(),
                user.getPassword(),
                user.getBlocked() != null ? user.getBlocked() : false,
                user.getStatus() != null ? user.getStatus() : true,
                Collections.singleton(authority),
                user.getPasswordChangedAt()
        );
    }

    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isBlocked; // Refleja si la cuenta está bloqueada
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }
}
