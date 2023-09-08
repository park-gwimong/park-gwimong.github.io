---
layout: post
title: "QueryDSL gradle 설정"
subtitle: "QueryDSL 설정 시 유의 사항"
date: 2023-09-08 19:08:00+0900
categories: [ "Programming" ]
tags: [ "Java", "Spring", "QueryDSL", "Gradle" ]
mathjax: true
---

# QueryDSL?
Querydsl은 JPA, MongoDB 및 Java SQL을 포함한 여러 백엔드에 대해 유형이 안전한 SQL 유사 쿼리를 생성할 수 있는 프레임워크입니다.  

쿼리를 인라인 문자열로 작성하거나 XML 파일로 외부화하는 대신 유창한 API를 통해 구성됩니다.  

[[홈페이지]](http://querydsl.com/)

## Gradle을 이용한 설정

### querydsl 버전 정의
```groovy
buildscript {
    ext {
        queryDslVersion = "5.0.0"
    }
}
```

### 의존성 설정
```groovy
dependencies {
    implementation "com.querydsl:querydsl-jpa:${queryDslVersion}"
    implementation "com.querydsl:querydsl-apt:${queryDslVersion}"
    annotationProcessor "com.querydsl:querydsl-apt:${queryDslVersion}"
}
```
Gradle plugin(com.ewerk.gradle.plugins.querydsl)을 사용하는 방법도 있으나, 해당 플러그인의 버전과 Intellij의 버전 등의 호환성으로 문제가 발생할 수도 있습니다.  
참조 : [[gradle] 그레이들 Annotation processor 와 Querydsl](http://honeymon.io/tech/2020/07/09/gradle-annotation-processor-with-querydsl.html)

### Querydsl 설정
```groovy
def querydslDir = "$buildDir/generated/querydsl"

querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}
sourceSets {
    main.java.srcDir querydslDir
}
configurations {
    querydsl.extendsFrom compileClasspath
}
compileQuerydsl {
    options.annotationProcessorPath = configurations.querydsl
}
```
QClass 생성 경로 등을 설정합니다.

## Querydsl 빌드

### Clean
```shell
gradle cleanQuerydslSourcesDir
```

### Build
```shell
gradle compileQuerydsl
```

## 문제 해결
### compileQuerydsl 빌드 실패 
대부분 버전간 호환성이나 Gradle / IDE 설정이 문제인 경우가 많습니다.  
이런 경우 아래 사항들을 확인해보시기 바랍니다.

1. IDE의 Annotation 설정 확인
   annotationProcessor을 사용하는 경우, IDE에서 해당 옵션을 활성해 줘야 합니다.  
   ![img](/resource/2023/20230908/20230908-img-1.png)
2. IDE의 빌드 설정 확인
   Gradle의 빌가 아닌 IDE의 빌드 사용.  
   ![img](/resource/2023/20230908/20230908-img-2.png)

### QClass 생성 실패

```
test.java : error: cannot find symbol
import test.QTest;
              ^
```
QClass가 생성되어야 위 코드가 정상적으로 수행될텐데, 위 QTest라는 클래스가 없다며 빌드가 안되는 현상이 발생했습니다.

이러한 현상은 Class 또는 Interfaced를 정의 할 때, 상속 받는 Class나 추상 클래스의 구조가 다른 경우입니다.    
( error: interface expected / Wrong number of type arguments)
 