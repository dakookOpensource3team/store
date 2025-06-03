package com.example.ddd_start.product.domain;

import java.time.Instant;
import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "image_type")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "image")
public abstract class Image {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "image_path")
  private String path;

  @CreatedDate
  private Instant uploadTime;

  @ManyToOne
  @JoinColumn(name = "product_id")
  private Product product;

  public Image(String path, Instant uploadTime, Product product) {
    this.path = path;
    this.uploadTime = uploadTime;
    this.product = product;
  }

  protected String getPath() {
    return path;
  }

  public Instant getUploadTime() {
    return uploadTime;
  }

  public abstract String getURL();

  public abstract boolean hasThumbnail();

  public abstract String getThumbnailURL();
}
