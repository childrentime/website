---
title: Tesseract Java
date: "2023-09-10"
category: Tech
tag: "java"
description: "Use tesseract in Java."
---

## Tesseract

### Install

```shell
brew install tesseract
```

### Download Training data

Go [https://github.com/tesseract-ocr/tessdata](https://github.com/tesseract-ocr/tessdata) and download your language.

### Set Training data path

1. edit `.zshrc`

```zsh
export TESSDATA_PREFIX=/Users/lianwenwu/tessdata
```

The path should contain the data you have downloaded.

2. reload

```zsh
source ~/.zshrc
```

## Java

### Add deps

add tess4j and jna.

```xml
 <dependency>
      <groupId>net.sourceforge.tess4j</groupId>
      <artifactId>tess4j</artifactId>
      <version>4.5.4</version>
  </dependency>
 <dependency>
    <groupId>net.java.dev.jna</groupId>
    <artifactId>jna</artifactId>
    <version>5.8.0</version>
  </dependency>
```

### Set jna path

```shell
brew info tesseract
```

```java
System.setProperty("jna.library.path", "/opt/homebrew/Cellar/tesseract/5.3.2_1/lib");
```

### Init and use

```java
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import net.sourceforge.tess4j.Tesseract;

private static final Tesseract tesseract = new Tesseract();

private static String recognize(String base64Image) throws Exception {
      if (base64Image.contains(",")) {
          base64Image = base64Image.split(",")[1];
      }
      byte[] imageBytes = Base64.getDecoder().decode(base64Image);
      BufferedImage img = ImageIO.read(new ByteArrayInputStream(imageBytes));
      return tesseract.doOCR(img);
}
```
