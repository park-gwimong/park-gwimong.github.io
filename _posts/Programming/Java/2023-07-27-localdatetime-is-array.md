---
layout: post
title: "Spring에서 Localdatetime이 Array 형태로 표출 되는 현상"
subtitle: "jackson-datatype-jsr310와 MvcEnable"
date: 2023-07-27 17:52:00+0900
categories: [ "Programming" ]
tags: [ "Spring", "Localdatetime" ]
mathjax: true
---

## 오류 현상
Spring에서 LocalDateTime을 JSON으로 변환 시 Array 형태로 표출 되는 현상이 발생하였습니다.  
```json
{
    "id": 1,
    "name": "test",
    "createdAt": [
        2023,
        7,
        27,
        15,
        47,
        7,
        972737100
    ],
    "updatedAt": [
        2023,
        7,
        27,
        15,
        47,
        7,
        972737100
    ]
}
```

## 원인 분석
Spring 2.0.0이상의 버전에서는 데이터 반환 시 별다른 설정을 하지 않아도 LocatDateTime의 값을 String 으로 자동으로 변환하여 반환합니다.  
이는 [jackson-datatype-jsr310](https://mvnrepository.com/artifact/com.fasterxml.jackson.datatype/jackson-datatype-jsr310/2.9.9)가 기본적으로 포함되어 있어 있기 때문입니다.  
> Add-on module to support JSR-310 (Java 8 Date & Time API) data types.  

하지만, EnableWebMvc를 설정하면 Springd은 자체적으로 기본적인 ObjectMapper를 구성하게 됩니다.  
이로 인해 직렬화와 관련된 설정들이 변경될 수 있으며, 사용자 정의 설정이 무시될 수 있습니다.  

(Spring 2.7.0 기준)   
Spring이 WebMvcConfigurerAdapter 클래스를 자동으로 등록할 때, configureMessageConverters 메서드를 재정의하고. 이 때 jackon-datatype-jar310이 적용되지 않는 것으로 추측됩니다.  


## 해결 방안
이러한 문제를 해결하기 위해서는 해당 필드에 JsonFormat를 지정하거나, ObjectMapper를 등록 또는 재정의하는 방법이 있습니다.


1. Spring MVC 비활성화  
    - @EnableWebMvc 제거
    - WebMvcConfigurationSupport -> WebMvcConfiguration  
   <br>
2. JsonFormat  
    가장 간단한 방법으로, 해당 필드에 @JsonFormat를 지정하는 방법입니다.
    ```java
    @JsonFormat(shape = JsonFormat.Shape.STRING,
    pattern = "yyyy/MM/dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    ```  
   간단하게 적용 할 수 있는 장점이 있지만, 매번 필드에 정의 해줘야 하는 불편함이 있습니다.
    <br><br>
3. 사용자 정의 ObjectMapper 등록  
    사용자가 ObjectMapper를 구현하고 이를 Spring에 등록하는 방법입니다.  
    ```java
    @Configuration
    public class WebMvcConfig implements WebMvcConfigurer {
        @Override
        public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
            MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
            converter.setObjectMapper(customObjectMapper());
            converters.add(converter);
        }

        @Bean
        public ObjectMapper customObjectMapper() {
            ObjectMapper objectMapper = new ObjectMapper();
            // 여기에 원하는 ObjectMapper 설정을 추가할 수 있습니다.
           return objectMapper;
        }
    }
    ```
   <br>
4. ObjectMapper 재정의  
   Jackson2ObjectMapperBuilder 클래스를 재정의하는 방법입니다.  
    ```java
    @Configuration
    public class WebMvcConfig implements WebMvcConfigurer {
        @Override
        public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
            converters.add(mappingJackson2HttpMessageConverter());
        }

        @Bean
        public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
            Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            builder.dateFormat(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ"));
            return new MappingJackson2HttpMessageConverter(builder.build());
        }
    }
    ```