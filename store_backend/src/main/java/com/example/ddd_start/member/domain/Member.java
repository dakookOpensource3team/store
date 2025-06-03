package com.example.ddd_start.member.domain;

import com.example.ddd_start.common.domain.Address;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "member", indexes = @Index(name = "idx_username", columnList = "username"))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@EqualsAndHashCode(of = "id")
@Builder
public class Member implements UserDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(columnDefinition = "varchar(30)")
  private String email;
  @Column(columnDefinition = "varchar(15)")
  private String username;
  private String password;
  private String name;
  @Embedded
  private Address address;
  private Boolean blocked;
  @Enumerated(EnumType.STRING)
  private MemberGrade memberGrade;

  @ElementCollection
  private List<String> roles = new ArrayList<>();

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return this.roles.stream()
        .map(SimpleGrantedAuthority::new)
        .toList();
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

  public Member(String username, String email, String password, String name, Address address,
      String role) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.name = name;
    this.address = address;
    this.memberGrade = MemberGrade.GENERAL;
    this.blocked = false;
    this.roles.add(role);
  }

  public void changeEmail(String email) {
    this.email = email;
  }

  public void changeUsername(String username) {
    this.username = username;
  }

  public void changeName(String name) {
    this.name = name;
  }

  public void changePassword(String changePassword) {
    this.password = changePassword;
  }

  public void changeAddress(Address address) {
    this.address = address;
  }

  public void block() {
    this.blocked = true;
  }
}
