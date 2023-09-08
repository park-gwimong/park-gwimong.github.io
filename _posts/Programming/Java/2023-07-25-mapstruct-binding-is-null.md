---
layout: post
title: "Mapstruct로 DTO 변환 시 주의 사항"
subtitle: "Unmapped target property 경고"
date: 2023-07-25 18:45:00+0900
categories: [ "Programming" ]
tags: [ "Spring", "Mapstruct" ]
mathjax: true
---

# Mapstruct 
> MapStruct is a code generator that greatly simplifies the implementation of mappings between Java bean types based on a convention over configuration approach.
The generated mapping code uses plain method invocations and thus is fast, type-safe and easy to understand.

MapStruct는 Java bean 유형 간의 매핑 구현을 단순화하는 코드 생성기입니다.  

Spring에서는 interface를 정의하고 @Mapper 이노테이션을 달아주면, 간단하게 코드를 자동 생성시키고 이를 bean으로 등록시킵니다.

```java
@Mapper
public interface TestMapper  {
    TestMapper MAPPER = Mappers.getMapper(TestMapper.class);
}
```

위의 TestMapper 코드에 변환하고자 하는 Java bean 유형을 정의하여 사용하면 됩니다.  

## 주의 사항
Mapstruct는 매핑 구현 코드를 자동으로 생성 할 때, 변환하고자 하는 Java bean 유형의 __생성자__ 또는 __builder__ 를 사용하여 구현됩니다.  

id와 name 필드를 가지는 Entity입니다.  
```java
@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
public class TestEntity {
    int id;
    String name;
    
    @Builder
    public TestEntity(String name) {
        this.name = name;
    }
}
```

DTO를 Entity로 변환하는 맵퍼입니다.   
```java
@Mapper
public interface TestMapper {
    TestMapper MAPPER = Mappers.getMapper(TestMapper.class);
    TestEntity toEntity(TestDto dto);
}
```

### 생성자 이용 시
생성자에 지정된 필드를 기준으로 매핑 구현 코드가 생성 됩니다.
```java
public class TestDto {
    
    private String name;
    
    public TestDto(String name) {
        this.name = name;
    }
}
```
```java
public class TestMapperImpl implements TestMapper {
    public TestEntity toEntity(TestDto dto) {
        if (dto == null) {
            return null;
        }

        String name = null;
        name = dto.getName();

        TestEntity testEntity = new TestEntity(name);

        return testEntity;
    }
}
```
위 코드를 빌드하면 __<U>아래와 같은 경고</U>__ 가 발생합니다. 
> Task :compileJava  
mapper\EntityMapper.java:4: warning: Unmapped target property: "id".  
TestEntity toEntity(TestDto dto);  
^
1 warning

TestEntity의 id 필드와 팹핑되는 필드가 없어서 발생하는 경고입니다.  
이를 해결하기 위해 Mapping 시 id를 매핑하지 않도록 설정합니다.  
```java
@Mapper
public interface TestMapper {
    TestMapper MAPPER = Mappers.getMapper(TestMapper.class);

    @Mapping(ignore = true, target = "id")
    TestEntity toEntity(TestDto dto);
}

```
### Builder 이용 시
정의된 Builder 메소드를 통해 매핑 구현 코드가 생성 됩니다.  
```java
public class TestDto {

    private String name;

    @Builder
    public TestDto(String name) {
        this.name = name;
    }
}
```
```java
public class TestMapperImpl implements TestMapper {
    public TestEntity toEntity(TestDto dto) {
        if (dto == null) {
            return null;
        }

        TestEntityBuilder testEntity = TestEntity.builder();

        testEntity.name(dto.getName());

        return testEntity.build();
    }
}
```

빌드 패턴을 사용하면, 위의 "warning: Unmapped target property"가 발생하지 않습니다.  
(Mapstruct는 builder가 모든 필드를 맵핑한 것으로 판단하는 것 같습니다.)


Lombok의 @builder로 빌드 패턴을 사용 시,   
__annotationProcessor의 순서는 mapstruct-processo가 lombock보다 앞에 정의__ 되어야 합니다.
```yaml
annotationProcessor "org.mapstruct:mapstruct-processor:1.4.2.Final"
annotationProcessor "org.projectlombok:lombok:1.18.20"
annotationProcessor "org.projectlombok:lombok-mapstruct-binding:0.2.0"
```