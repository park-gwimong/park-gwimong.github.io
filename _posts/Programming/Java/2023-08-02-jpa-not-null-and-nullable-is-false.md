---
layout: post
title: "Spring Boot JPA로 Entity의 Default 값 설정하기"
subtitle: "@NotNull과 @ColumnDefault 차이"
date: 2023-08-02 16:44:00+0900
categories: [ "Programming" ]
tags: [ "Spring", "JPA", "hibernate", "validation" ]
mathjax: true
---

Spring Boot JPA로 Entity 설계 시, 컬럼에 Null을 허용하지 않도록 설정하기 위해  
__@NotNull__ 또는 __@Column(nullable = false)__ 을 사용합니다.

이 둘의 차이점에 대해 간략하게 정의하고자 합니다.

# @Column

Spring JPA에서 제공되는 이노테이션으로 Entity의 컬럼을 지정합니다.  
이 때, 아래의 속성들을 지정할 수 있습니다.

- name : 컬럼 이름
- insertable : 엔티티 저장시 함께 저장
- updateable : 엔티티 수정시 함께 수정
- table : 다른 테이블에 맵핑
- nullable : NULL을 허용 여부
- unique : 제약조건 설정
- columnDefinition : 컬럼 정보
- length : varchar의 길이(기본값 255)
- precsion : BigInteger 타입에서 소수점 포함 자리 수
- scale : , BigDecimal 타입에서 소수의 자리 수

# @NotNull

> JSR-303/JSR-349 Bean Validation  
> Spring Framework 4.0 supports Bean Validation 1.0 (JSR-303) and Bean Validation 1.1 (JSR-349) in terms of setup
> support,
> also adapting it to Spring’s Validator interface.  
> An application can choose to enable Bean Validation once globally, as described in Section 7.8, “Spring Validation”,
> and
> use it exclusively for all validation needs.  
> An application can also register additional Spring Validator instances per DataBinder instance, as described in
> Section
> 7.8.3, “Configuring a DataBinder”. This may be useful for plugging in validation logic without the use of annotations.

Spring Framework 4.0부터 지원되는 Bean Valication입니다.  
주로 Spring의 Validator가 유효성 검증을 수행할 때 사용되는 이노테이션입니다.

# 차이점

@Column(nullable = false)로 설정하는 것은 Entity 컬럼의 null 허용 여부를 설정하는 것이고,  
@NotNull은 Java Bean의 null 유효성 검증을 위한 설정입니다.

즉, 위 2개의 이노테이션은 사용 목적이 다릅니다.

## @Column(nullable = false) 설정

```java

@Entity
public class Test {
    @Id
    private int id;

    @Column(nullable = false)
    private String name;
}
```

Entity와 Table의 DDL에 NOT NULL로 설정되고 DB에 Null 값을 입력 할 때 오류가 발생합니다.
> org.springframework.dao.DataIntegrityViolationException: could not execute statement; SQL [n/a]; constraint [null];

## @NotNull 설정

```java

@Entity
public class Test {
    @Id
    private int id;

    @NotNull
    private String name;
}
```

Entity의 유효성 검증 시 오류가 발생합니다.
> ConstraintViolationImpl{interpolatedMessage='널이어서는 안됩니다', propertyPath=name, rootBeanClass=class

---

# 정리

@Column(nullable = false)은 DB에 제약조건을 거는 것이고,  
@NotNull은 유효성 검사를 수행하는 것입니다.

hibernate는 @NotNull가 설정되어 있으면 자동으로 DB에 제약조건을 추가해줍니다.

> @NotNull = @Column(nullable = false) + 유효성 검사

  