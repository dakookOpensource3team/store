package com.example.ddd_start.category.domain;

import java.time.Instant;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
public class Category {

  @Id
  private Long id;
  @Column(columnDefinition = "TEXT")
  private String name;
  @Column(columnDefinition = "varchar(20)")
  private String slug;
  @Column(columnDefinition = "TEXT")
  private String imageUrl;
  private Instant createdAt;
  private Instant updatedAt;

  public Category(Long id, String name, String slug, String imageUrl,
      Instant createdAt, Instant updatedAt) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public Category(String name, String slug, String imageUrl, Instant createdAt,
      Instant updatedAt) {
    this.name = name;
    this.slug = slug;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
