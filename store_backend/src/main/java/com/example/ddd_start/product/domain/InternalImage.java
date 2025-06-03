package com.example.ddd_start.product.domain;

import java.time.Instant;
import java.util.NoSuchElementException;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("II")
@NoArgsConstructor
public class InternalImage extends Image {

  private String thumbnailURL;

  public InternalImage(String path, Instant uploadTime, String thumbnailURL, Product product) {
    super(path, uploadTime, product);
    this.thumbnailURL = thumbnailURL;
  }

  @Override
  public String getURL() {
    return this.getPath();
  }

  @Override
  public boolean hasThumbnail() {
    return true;
  }

  @Override
  public String getThumbnailURL() {
    if (hasThumbnail()) {
      return this.thumbnailURL;
    }
    throw new NoSuchElementException();
  }
}
